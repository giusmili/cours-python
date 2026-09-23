<?php
declare(strict_types=1);

namespace mod_lgcplayground\completion;

defined('MOODLE_INTERNAL') || die();

use core_completion\activity_custom_completion;
use mod_lgcplayground\local\mission_repository;
use mod_lgcplayground\local\progress_repository;

/**
 * Custom completion rules for the Playground activity.
 */
final class custom_completion extends activity_custom_completion {
    /**
     * @param string $rule
     * @return int
     */
    public function get_state(string $rule): int {
        global $DB;

        $this->validate_rule($rule);

        if ($rule !== 'completionpass') {
            return COMPLETION_INCOMPLETE;
        }

        $activity = $DB->get_record('lgcplayground', ['id' => $this->cm->instance], '*', MUST_EXIST);
        if (empty($activity->completionpass)) {
            return COMPLETION_INCOMPLETE;
        }

        $pack = mission_repository::load((string)$activity->missionpack);
        $missionids = mission_repository::ids_for_track($pack, (string)$activity->track);

        return progress_repository::all_required_passed(
            (int)$activity->id,
            (int)$this->userid,
            $missionids,
        ) ? COMPLETION_COMPLETE : COMPLETION_INCOMPLETE;
    }

    /**
     * @return string[]
     */
    public static function get_defined_custom_rules(): array {
        return ['completionpass'];
    }

    /**
     * @return array
     */
    public function get_custom_rule_descriptions(): array {
        return [
            'completionpass' => get_string('completiondetail:pass', 'mod_lgcplayground'),
        ];
    }

    /**
     * @return string[]
     */
    public function get_sort_order(): array {
        return [
            'completionview',
            'completionpass',
        ];
    }
}
