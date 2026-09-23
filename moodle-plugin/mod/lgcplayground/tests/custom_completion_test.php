<?php
declare(strict_types=1);

namespace mod_lgcplayground;

defined('MOODLE_INTERNAL') || die();

use advanced_testcase;
use mod_lgcplayground\completion\custom_completion;
use mod_lgcplayground\local\progress_repository;

/**
 * Tests for the Playground automatic completion rule.
 *
 * @package mod_lgcplayground
 */
final class custom_completion_test extends advanced_testcase {
    public function test_completion_requires_all_missions_in_activity_track(): void {
        $this->resetAfterTest();

        $course = $this->getDataGenerator()->create_course(['enablecompletion' => 1]);
        $activity = $this->getDataGenerator()->create_module('lgcplayground', [
            'course' => $course->id,
            'name' => 'Completion test',
            'track' => 'python',
            'missionpack' => 'python-basics-v1',
            'completion' => COMPLETION_TRACKING_AUTOMATIC,
            'completionpass' => 1,
        ]);
        $student = $this->getDataGenerator()->create_and_enrol($course, 'student');

        $cm = get_fast_modinfo($course, $student->id)->get_cm($activity->cmid);
        $completion = new custom_completion($cm, (int)$student->id);

        $this->assertSame(COMPLETION_INCOMPLETE, $completion->get_state('completionpass'));

        progress_repository::record_attempt(
            (int)$activity->id,
            (int)$student->id,
            'python-00-terminal',
            true,
        );

        $this->assertSame(COMPLETION_COMPLETE, $completion->get_state('completionpass'));
    }

    public function test_rule_metadata_is_consistent(): void {
        $this->resetAfterTest();

        $course = $this->getDataGenerator()->create_course(['enablecompletion' => 1]);
        $activity = $this->getDataGenerator()->create_module('lgcplayground', [
            'course' => $course->id,
            'completion' => COMPLETION_TRACKING_AUTOMATIC,
            'completionpass' => 1,
        ]);
        $student = $this->getDataGenerator()->create_and_enrol($course, 'student');
        $cm = get_fast_modinfo($course, $student->id)->get_cm($activity->cmid);

        $completion = new custom_completion($cm, (int)$student->id);

        $this->assertSame(['completionpass'], custom_completion::get_defined_custom_rules());
        $this->assertArrayHasKey('completionpass', $completion->get_custom_rule_descriptions());
        $this->assertTrue($completion->is_defined('completionpass'));
        $this->assertFalse($completion->is_defined('doesnotexist'));
    }
}
