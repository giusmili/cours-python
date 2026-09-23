<?php
namespace mod_lgcplayground;

use backup;
use backup_controller;
use backup_setting;
use restore_controller;
use restore_dbops;

/**
 * Backup/restore coverage for the Playground activity and learner progress.
 *
 * @package mod_lgcplayground
 * @coversNothing
 */
final class backup_restore_test extends \advanced_testcase {
    public static function setUpBeforeClass(): void {
        global $CFG;
        parent::setUpBeforeClass();
        require_once($CFG->dirroot . '/backup/util/includes/backup_includes.php');
        require_once($CFG->dirroot . '/backup/util/includes/restore_includes.php');
    }

    public function test_backup_restore_preserves_instance_and_user_progress(): void {
        global $CFG, $DB, $USER;
        $this->resetAfterTest(true);
        $this->setAdminUser();
        $CFG->backup_file_logger_level = backup::LOG_NONE;

        $course = $this->getDataGenerator()->create_course();
        $student = $this->getDataGenerator()->create_user();
        $this->getDataGenerator()->enrol_user($student->id, $course->id, 'student');
        $activity = $this->getDataGenerator()->create_module('lgcplayground', [
            'course' => $course->id,
            'name' => 'Backup me',
            'track' => 'python',
            'missionpack' => 'python-basics-v1',
        ]);
        $DB->insert_record('lgcplayground_progress', (object) [
            'playgroundid' => $activity->id, 'userid' => $student->id,
            'missionid' => 'python-00-terminal', 'attempts' => 2, 'passed' => 1,
            'timefirstattempt' => 10, 'timelastattempt' => 20, 'timepassed' => 20,
            'timecreated' => 10, 'timemodified' => 20,
        ]);

        $bc = new backup_controller(backup::TYPE_1COURSE, $course->id, backup::FORMAT_MOODLE,
            backup::INTERACTIVE_NO, backup::MODE_IMPORT, $USER->id);
        $bc->get_plan()->get_setting('users')->set_status(backup_setting::NOT_LOCKED);
        $bc->get_plan()->get_setting('users')->set_value(true);
        $backupid = $bc->get_backupid();
        $bc->execute_plan();
        $bc->destroy();

        $newcourseid = restore_dbops::create_new_course('Restored', 'restored-' . uniqid(), $course->category);
        $rc = new restore_controller($backupid, $newcourseid, backup::INTERACTIVE_NO,
            backup::MODE_GENERAL, $USER->id, backup::TARGET_NEW_COURSE);
        $rc->get_plan()->get_setting('users')->set_status(backup_setting::NOT_LOCKED);
        $rc->get_plan()->get_setting('users')->set_value(true);
        $this->assertTrue($rc->execute_precheck());
        $rc->execute_plan();
        $rc->destroy();

        $restored = $DB->get_record('lgcplayground', ['course' => $newcourseid], '*', MUST_EXIST);
        $this->assertSame('Backup me', $restored->name);
        $this->assertSame('python-basics-v1', $restored->missionpack);
        $progress = $DB->get_record('lgcplayground_progress', [
            'playgroundid' => $restored->id, 'userid' => $student->id,
            'missionid' => 'python-00-terminal',
        ], '*', MUST_EXIST);
        $this->assertSame(2, (int) $progress->attempts);
        $this->assertSame(1, (int) $progress->passed);
    }
}
