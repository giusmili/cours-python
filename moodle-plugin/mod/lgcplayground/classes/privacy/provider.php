<?php
namespace mod_lgcplayground\privacy;

defined('MOODLE_INTERNAL') || die();

use core_privacy\local\metadata\collection;
use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\approved_userlist;
use core_privacy\local\request\contextlist;
use core_privacy\local\request\userlist;
use core_privacy\local\request\writer;

/**
 * Privacy provider for learner mission progress.
 */
final class provider implements
        \core_privacy\local\metadata\provider,
        \core_privacy\local\request\plugin\provider,
        \core_privacy\local\request\core_userlist_provider {
    /**
     * @param collection $items
     * @return collection
     */
    public static function get_metadata(collection $items): collection {
        $items->add_database_table(
            'lgcplayground_progress',
            [
                'playgroundid' => 'privacy:metadata:progress:playgroundid',
                'userid' => 'privacy:metadata:progress:userid',
                'missionid' => 'privacy:metadata:progress:missionid',
                'attempts' => 'privacy:metadata:progress:attempts',
                'passed' => 'privacy:metadata:progress:passed',
                'timefirstattempt' => 'privacy:metadata:progress:timefirstattempt',
                'timelastattempt' => 'privacy:metadata:progress:timelastattempt',
                'timepassed' => 'privacy:metadata:progress:timepassed',
                'timecreated' => 'privacy:metadata:progress:timecreated',
                'timemodified' => 'privacy:metadata:progress:timemodified',
            ],
            'privacy:metadata:progress',
        );

        return $items;
    }

    /**
     * @param int $userid
     * @return contextlist
     */
    public static function get_contexts_for_userid(int $userid): contextlist {
        $sql = "SELECT ctx.id
                  FROM {context} ctx
                  JOIN {course_modules} cm
                    ON cm.id = ctx.instanceid
                   AND ctx.contextlevel = :contextlevel
                  JOIN {modules} m
                    ON m.id = cm.module
                   AND m.name = :modname
                  JOIN {lgcplayground_progress} progress
                    ON progress.playgroundid = cm.instance
                 WHERE progress.userid = :userid";

        $contextlist = new contextlist();
        $contextlist->add_from_sql($sql, [
            'contextlevel' => CONTEXT_MODULE,
            'modname' => 'lgcplayground',
            'userid' => $userid,
        ]);

        return $contextlist;
    }

    /**
     * @param userlist $userlist
     * @return void
     */
    public static function get_users_in_context(userlist $userlist) {
        $context = $userlist->get_context();
        if (!$context instanceof \context_module) {
            return;
        }

        $sql = "SELECT progress.userid
                  FROM {course_modules} cm
                  JOIN {modules} m
                    ON m.id = cm.module
                   AND m.name = :modname
                  JOIN {lgcplayground_progress} progress
                    ON progress.playgroundid = cm.instance
                 WHERE cm.id = :cmid";

        $userlist->add_from_sql('userid', $sql, [
            'modname' => 'lgcplayground',
            'cmid' => $context->instanceid,
        ]);
    }

    /**
     * @param approved_contextlist $contextlist
     * @return void
     */
    public static function export_user_data(approved_contextlist $contextlist) {
        global $DB;

        if (!$contextlist->count()) {
            return;
        }

        $userid = (int)$contextlist->get_user()->id;
        foreach ($contextlist->get_contexts() as $context) {
            if (!$context instanceof \context_module) {
                continue;
            }

            $cm = get_coursemodule_from_id('lgcplayground', $context->instanceid, 0, false, IGNORE_MISSING);
            if (!$cm) {
                continue;
            }

            $records = $DB->get_records(
                'lgcplayground_progress',
                ['playgroundid' => $cm->instance, 'userid' => $userid],
                'missionid ASC',
                'missionid, attempts, passed, timefirstattempt, timelastattempt, timepassed, timemodified',
            );

            $missions = [];
            foreach ($records as $record) {
                $missions[] = [
                    'missionid' => $record->missionid,
                    'attempts' => (int)$record->attempts,
                    'passed' => (bool)$record->passed,
                    'timefirstattempt' => (int)$record->timefirstattempt,
                    'timelastattempt' => (int)$record->timelastattempt,
                    'timepassed' => (int)$record->timepassed,
                    'timemodified' => (int)$record->timemodified,
                ];
            }

            writer::with_context($context)->export_data(
                [get_string('privacy:path:progress', 'mod_lgcplayground')],
                (object)['missions' => $missions],
            );
        }
    }

    /**
     * @param \context $context
     * @return void
     */
    public static function delete_data_for_all_users_in_context(\context $context) {
        global $DB;

        if (!$context instanceof \context_module) {
            return;
        }

        $cm = get_coursemodule_from_id('lgcplayground', $context->instanceid, 0, false, IGNORE_MISSING);
        if ($cm) {
            $DB->delete_records('lgcplayground_progress', ['playgroundid' => $cm->instance]);
        }
    }

    /**
     * @param approved_contextlist $contextlist
     * @return void
     */
    public static function delete_data_for_user(approved_contextlist $contextlist) {
        global $DB;

        if (!$contextlist->count()) {
            return;
        }

        $userid = (int)$contextlist->get_user()->id;
        foreach ($contextlist->get_contexts() as $context) {
            if (!$context instanceof \context_module) {
                continue;
            }

            $cm = get_coursemodule_from_id('lgcplayground', $context->instanceid, 0, false, IGNORE_MISSING);
            if ($cm) {
                $DB->delete_records('lgcplayground_progress', [
                    'playgroundid' => $cm->instance,
                    'userid' => $userid,
                ]);
            }
        }
    }

    /**
     * @param approved_userlist $userlist
     * @return void
     */
    public static function delete_data_for_users(approved_userlist $userlist) {
        global $DB;

        $context = $userlist->get_context();
        if (!$context instanceof \context_module) {
            return;
        }

        $cm = get_coursemodule_from_id('lgcplayground', $context->instanceid, 0, false, IGNORE_MISSING);
        if (!$cm) {
            return;
        }

        $userids = $userlist->get_userids();
        if (!$userids) {
            return;
        }

        [$insql, $inparams] = $DB->get_in_or_equal($userids, SQL_PARAMS_NAMED, 'user');
        $DB->delete_records_select(
            'lgcplayground_progress',
            "playgroundid = :playgroundid AND userid {$insql}",
            ['playgroundid' => $cm->instance] + $inparams,
        );
    }
}
