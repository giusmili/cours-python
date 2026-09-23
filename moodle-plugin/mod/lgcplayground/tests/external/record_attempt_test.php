<?php
declare(strict_types=1);

namespace mod_lgcplayground\external;

defined('MOODLE_INTERNAL') || die();

use advanced_testcase;
use completion_info;

/**
 * Tests for the authenticated progress endpoint.
 *
 * @package mod_lgcplayground
 */
final class record_attempt_test extends advanced_testcase {
    public function test_failed_then_all_passed_updates_progress_and_completion(): void {
        global $DB;

        $this->resetAfterTest();

        $course = $this->getDataGenerator()->create_course(['enablecompletion' => 1]);
        $activity = $this->getDataGenerator()->create_module('lgcplayground', [
            'course' => $course->id,
            'name' => 'Endpoint test',
            'track' => 'python',
            'missionpack' => 'python-basics-v1',
            'completion' => COMPLETION_TRACKING_AUTOMATIC,
            'completionpass' => 1,
        ]);
        $student = $this->getDataGenerator()->create_and_enrol($course, 'student');
        $this->setUser($student);

        $failed = record_attempt::execute(
            (int)$activity->cmid,
            'python-00-terminal',
            false,
        );
        $this->assertSame(1, $failed['attempts']);
        $this->assertFalse($failed['passed']);
        $this->assertFalse($failed['activitypassed']);

        $passedp0 = record_attempt::execute(
            (int)$activity->cmid,
            'python-00-terminal',
            true,
        );
        $this->assertSame(2, $passedp0['attempts']);
        $this->assertTrue($passedp0['passed']);
        $this->assertFalse($passedp0['activitypassed']);
        $this->assertGreaterThan(0, $passedp0['timepassed']);

        $passedp1 = record_attempt::execute(
            (int)$activity->cmid,
            'python-01-variables',
            true,
        );
        $this->assertTrue($passedp1['passed']);
        $this->assertFalse($passedp1['activitypassed']);

        $passedp2 = record_attempt::execute(
            (int)$activity->cmid,
            'python-02-types',
            true,
        );
        $this->assertTrue($passedp2['passed']);
        $this->assertTrue($passedp2['activitypassed']);

        $stored = $DB->get_record('lgcplayground_progress', [
            'playgroundid' => $activity->id,
            'userid' => $student->id,
            'missionid' => 'python-00-terminal',
        ], '*', MUST_EXIST);
        $this->assertSame(2, (int)$stored->attempts);
        $this->assertSame(1, (int)$stored->passed);

        $cm = get_coursemodule_from_id('lgcplayground', $activity->cmid, 0, false, MUST_EXIST);
        $completion = new completion_info($course);
        $completiondata = $completion->get_data($cm, false, (int)$student->id);
        $this->assertSame(COMPLETION_COMPLETE, (int)$completiondata->completionstate);
    }

    public function test_unknown_mission_is_rejected(): void {
        $this->resetAfterTest();

        $course = $this->getDataGenerator()->create_course(['enablecompletion' => 1]);
        $activity = $this->getDataGenerator()->create_module('lgcplayground', [
            'course' => $course->id,
            'track' => 'python',
            'missionpack' => 'python-basics-v1',
        ]);
        $student = $this->getDataGenerator()->create_and_enrol($course, 'student');
        $this->setUser($student);

        $this->expectException(\invalid_parameter_exception::class);
        record_attempt::execute(
            (int)$activity->cmid,
            'python-99-does-not-exist',
            true,
        );
    }
}
