<?php
namespace mod_lgcplayground\local;

defined('MOODLE_INTERNAL') || die();

/**
 * Moodle-owned per-user progress for Playground missions.
 *
 * The repository deliberately stores no learner source code or stdout.
 */
final class progress_repository {
    /**
     * Return one mission progress row, or null when the learner never validated it.
     *
     * @param int $playgroundid
     * @param int $userid
     * @param string $missionid
     * @return \stdClass|null
     */
    public static function get(int $playgroundid, int $userid, string $missionid): ?\stdClass {
        global $DB;

        $record = $DB->get_record('lgcplayground_progress', [
            'playgroundid' => $playgroundid,
            'userid' => $userid,
            'missionid' => $missionid,
        ]);

        return $record ?: null;
    }

    /**
     * Record a validation attempt.
     *
     * Passing is monotonic: a later failed validation never removes an earlier pass.
     *
     * @param int $playgroundid
     * @param int $userid
     * @param string $missionid
     * @param bool $passed
     * @return \stdClass
     */
    public static function record_attempt(
        int $playgroundid,
        int $userid,
        string $missionid,
        bool $passed,
    ): \stdClass {
        global $DB;

        $now = time();
        $record = self::get($playgroundid, $userid, $missionid);

        if ($record) {
            $record->attempts = (int)$record->attempts + 1;
            $record->timelastattempt = $now;
            $record->timemodified = $now;

            if ($passed && empty($record->passed)) {
                $record->passed = 1;
                $record->timepassed = $now;
            }

            $DB->update_record('lgcplayground_progress', $record);
            return $record;
        }

        $record = (object)[
            'playgroundid' => $playgroundid,
            'userid' => $userid,
            'missionid' => $missionid,
            'attempts' => 1,
            'passed' => $passed ? 1 : 0,
            'timefirstattempt' => $now,
            'timelastattempt' => $now,
            'timepassed' => $passed ? $now : 0,
            'timecreated' => $now,
            'timemodified' => $now,
        ];
        $record->id = $DB->insert_record('lgcplayground_progress', $record);

        return $record;
    }

    /**
     * Return serialisable progress for one mission.
     *
     * @param int $playgroundid
     * @param int $userid
     * @param string $missionid
     * @return array
     */
    public static function export_mission(int $playgroundid, int $userid, string $missionid): array {
        $record = self::get($playgroundid, $userid, $missionid);

        return [
            'attempts' => $record ? (int)$record->attempts : 0,
            'passed' => $record ? (bool)$record->passed : false,
            'timepassed' => $record ? (int)$record->timepassed : 0,
        ];
    }

    /**
     * Check whether every required mission has been passed.
     *
     * @param int $playgroundid
     * @param int $userid
     * @param string[] $missionids
     * @return bool
     */
    public static function all_required_passed(int $playgroundid, int $userid, array $missionids): bool {
        global $DB;

        $missionids = array_values(array_unique(array_filter(
            $missionids,
            static fn(mixed $missionid): bool => is_string($missionid) && $missionid !== '',
        )));
        if (!$missionids) {
            return false;
        }

        [$insql, $inparams] = $DB->get_in_or_equal($missionids, SQL_PARAMS_NAMED, 'mission');
        $params = [
            'playgroundid' => $playgroundid,
            'userid' => $userid,
            ...$inparams,
        ];
        $sql = "SELECT missionid
                  FROM {lgcplayground_progress}
                 WHERE playgroundid = :playgroundid
                   AND userid = :userid
                   AND passed = 1
                   AND missionid {$insql}";

        $passedids = $DB->get_fieldset_sql($sql, $params);
        return count(array_unique($passedids)) === count($missionids);
    }
}
