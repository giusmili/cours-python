<?php
declare(strict_types=1);

namespace mod_lgcplayground\local;

defined('MOODLE_INTERNAL') || die();

use advanced_testcase;

/**
 * Tests for Moodle-owned Playground mission progress.
 *
 * @package mod_lgcplayground
 */
final class progress_repository_test extends advanced_testcase {
    /**
     * Create a minimal Playground activity and enrolled learner.
     *
     * @return array{0: \stdClass, 1: \stdClass, 2: \stdClass}
     */
    private function make_fixture(): array {
        $this->resetAfterTest();

        $course = $this->getDataGenerator()->create_course(['enablecompletion' => 1]);
        $activity = $this->getDataGenerator()->create_module('lgcplayground', [
            'course' => $course->id,
            'name' => 'Progress test',
            'track' => 'python',
            'missionpack' => 'python-basics-v1',
            'completionpass' => 1,
        ]);
        $student = $this->getDataGenerator()->create_and_enrol($course, 'student');

        return [$course, $activity, $student];
    }

    public function test_record_attempt_is_monotonic_after_pass(): void {
        [, $activity, $student] = $this->make_fixture();
        $missionid = 'python-00-terminal';

        $initial = progress_repository::export_mission(
            (int)$activity->id,
            (int)$student->id,
            $missionid,
        );
        $this->assertSame(0, $initial['attempts']);
        $this->assertFalse($initial['passed']);
        $this->assertSame(0, $initial['timepassed']);

        $failed = progress_repository::record_attempt(
            (int)$activity->id,
            (int)$student->id,
            $missionid,
            false,
        );
        $this->assertSame(1, (int)$failed->attempts);
        $this->assertSame(0, (int)$failed->passed);
        $this->assertSame(0, (int)$failed->timepassed);

        $passed = progress_repository::record_attempt(
            (int)$activity->id,
            (int)$student->id,
            $missionid,
            true,
        );
        $this->assertSame(2, (int)$passed->attempts);
        $this->assertSame(1, (int)$passed->passed);
        $this->assertGreaterThan(0, (int)$passed->timepassed);
        $firstpasstime = (int)$passed->timepassed;

        $laterfailure = progress_repository::record_attempt(
            (int)$activity->id,
            (int)$student->id,
            $missionid,
            false,
        );
        $this->assertSame(3, (int)$laterfailure->attempts);
        $this->assertSame(1, (int)$laterfailure->passed);
        $this->assertSame($firstpasstime, (int)$laterfailure->timepassed);
    }

    public function test_progress_is_isolated_per_user_and_mission(): void {
        [$course, $activity, $student] = $this->make_fixture();
        $otherstudent = $this->getDataGenerator()->create_and_enrol($course, 'student');

        progress_repository::record_attempt(
            (int)$activity->id,
            (int)$student->id,
            'python-00-terminal',
            true,
        );
        progress_repository::record_attempt(
            (int)$activity->id,
            (int)$student->id,
            'python-01-values',
            false,
        );

        $this->assertTrue(progress_repository::export_mission(
            (int)$activity->id,
            (int)$student->id,
            'python-00-terminal',
        )['passed']);
        $this->assertFalse(progress_repository::export_mission(
            (int)$activity->id,
            (int)$student->id,
            'python-01-values',
        )['passed']);
        $this->assertSame(0, progress_repository::export_mission(
            (int)$activity->id,
            (int)$otherstudent->id,
            'python-00-terminal',
        )['attempts']);
    }

    public function test_all_required_passed_requires_every_mission(): void {
        [, $activity, $student] = $this->make_fixture();

        progress_repository::record_attempt(
            (int)$activity->id,
            (int)$student->id,
            'python-00-terminal',
            true,
        );

        $this->assertFalse(progress_repository::all_required_passed(
            (int)$activity->id,
            (int)$student->id,
            ['python-00-terminal', 'python-01-values'],
        ));

        progress_repository::record_attempt(
            (int)$activity->id,
            (int)$student->id,
            'python-01-values',
            true,
        );

        $this->assertTrue(progress_repository::all_required_passed(
            (int)$activity->id,
            (int)$student->id,
            ['python-00-terminal', 'python-01-values'],
        ));
        $this->assertFalse(progress_repository::all_required_passed(
            (int)$activity->id,
            (int)$student->id,
            [],
        ));
    }
    public function test_summaries_for_users_aggregate_only_current_missions(): void {
        [$course, $activity, $student] = $this->make_fixture();
        $otherstudent = $this->getDataGenerator()->create_and_enrol($course, 'student');

        progress_repository::record_attempt(
            (int)$activity->id,
            (int)$student->id,
            'python-00-terminal',
            false,
        );
        progress_repository::record_attempt(
            (int)$activity->id,
            (int)$student->id,
            'python-00-terminal',
            true,
        );
        progress_repository::record_attempt(
            (int)$activity->id,
            (int)$student->id,
            'python-01-variables',
            true,
        );
        progress_repository::record_attempt(
            (int)$activity->id,
            (int)$student->id,
            'stale-mission-id',
            true,
        );
        progress_repository::record_attempt(
            (int)$activity->id,
            (int)$otherstudent->id,
            'python-00-terminal',
            false,
        );

        $summaries = progress_repository::summaries_for_users(
            (int)$activity->id,
            [(int)$student->id, (int)$otherstudent->id],
            ['python-00-terminal', 'python-01-variables'],
        );

        $this->assertSame(3, $summaries[(int)$student->id]['attempts']);
        $this->assertSame(2, $summaries[(int)$student->id]['passed']);
        $this->assertGreaterThan(0, $summaries[(int)$student->id]['lastattempt']);

        $this->assertSame(1, $summaries[(int)$otherstudent->id]['attempts']);
        $this->assertSame(0, $summaries[(int)$otherstudent->id]['passed']);
    }

}
