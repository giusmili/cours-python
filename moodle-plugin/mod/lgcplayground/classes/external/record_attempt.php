<?php
namespace mod_lgcplayground\external;

defined('MOODLE_INTERNAL') || die();

use context_module;
use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;
use mod_lgcplayground\local\mission_repository;
use mod_lgcplayground\local\progress_repository;

/**
 * AJAX endpoint used after a learner presses Validate.
 */
final class record_attempt extends external_api {
    /**
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'cmid' => new external_value(PARAM_INT, 'Course module id'),
            'missionid' => new external_value(PARAM_ALPHANUMEXT, 'Stable mission id'),
            'passed' => new external_value(PARAM_BOOL, 'Whether client-side mission validation passed'),
        ]);
    }

    /**
     * Record the attempt for the current authenticated user.
     *
     * @param int $cmid
     * @param string $missionid
     * @param bool $passed
     * @return array
     */
    public static function execute(int $cmid, string $missionid, bool $passed): array {
        global $DB, $USER;

        $params = self::validate_parameters(self::execute_parameters(), [
            'cmid' => $cmid,
            'missionid' => $missionid,
            'passed' => $passed,
        ]);

        [$course, $cm] = get_course_and_cm_from_cmid($params['cmid'], 'lgcplayground');
        $context = context_module::instance($cm->id);
        self::validate_context($context);
        require_capability('mod/lgcplayground:view', $context);

        if (isguestuser($USER)) {
            throw new \moodle_exception('guestprogressdisabled', 'mod_lgcplayground');
        }

        $activity = $DB->get_record('lgcplayground', ['id' => $cm->instance], '*', MUST_EXIST);
        $pack = mission_repository::load((string)$activity->missionpack);
        $missions = mission_repository::for_track($pack, (string)$activity->track);

        $knownids = array_column($missions, 'id');
        if (!in_array($params['missionid'], $knownids, true)) {
            throw new \invalid_parameter_exception('Mission does not belong to this activity.');
        }

        $progress = progress_repository::record_attempt(
            (int)$activity->id,
            (int)$USER->id,
            $params['missionid'],
            (bool)$params['passed'],
        );

        $activitypassed = progress_repository::all_required_passed(
            (int)$activity->id,
            (int)$USER->id,
            $knownids,
        );

        if (!empty($activity->completionpass)) {
            require_once($GLOBALS['CFG']->dirroot . '/lib/completionlib.php');
            $completion = new \completion_info($course);
            if ($completion->is_enabled($cm) && $activitypassed) {
                $completion->update_state($cm, COMPLETION_COMPLETE, (int)$USER->id);
            }
        }

        return [
            'attempts' => (int)$progress->attempts,
            'passed' => (bool)$progress->passed,
            'timepassed' => (int)$progress->timepassed,
            'activitypassed' => $activitypassed,
        ];
    }

    /**
     * @return external_single_structure
     */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'attempts' => new external_value(PARAM_INT, 'Number of validation attempts'),
            'passed' => new external_value(PARAM_BOOL, 'Whether this mission was ever passed'),
            'timepassed' => new external_value(PARAM_INT, 'First pass timestamp, or 0'),
            'activitypassed' => new external_value(PARAM_BOOL, 'Whether all required missions are passed'),
        ]);
    }
}
