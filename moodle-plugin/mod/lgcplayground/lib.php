<?php
defined('MOODLE_INTERNAL') || die();

/**
 * Returns the features supported by LGC Playground.
 *
 * @param string $feature
 * @return bool|string|null
 */
function lgcplayground_supports(string $feature): bool|string|null {
    return match ($feature) {
        FEATURE_MOD_INTRO => true,
        FEATURE_SHOW_DESCRIPTION => true,
        FEATURE_COMPLETION_HAS_RULES => true,
        FEATURE_BACKUP_MOODLE2 => true,
        default => null,
    };
}

/**
 * Add a Playground activity instance.
 *
 * @param stdClass $data
 * @param moodleform_mod|null $mform
 * @return int
 */
function lgcplayground_add_instance(stdClass $data, $mform = null): int {
    global $DB;

    $now = time();
    $data->timecreated = $now;
    $data->timemodified = $now;

    return (int)$DB->insert_record('lgcplayground', $data);
}

/**
 * Update a Playground activity instance.
 *
 * @param stdClass $data
 * @param moodleform_mod|null $mform
 * @return bool
 */
function lgcplayground_update_instance(stdClass $data, $mform = null): bool {
    global $DB;

    $data->id = $data->instance;
    $data->timemodified = time();

    return $DB->update_record('lgcplayground', $data);
}

/**
 * Delete a Playground activity instance.
 *
 * @param int $id
 * @return bool
 */
function lgcplayground_delete_instance(int $id): bool {
    global $DB;

    if (!$DB->record_exists('lgcplayground', ['id' => $id])) {
        return false;
    }

    $DB->delete_records('lgcplayground_progress', ['playgroundid' => $id]);
    $DB->delete_records('lgcplayground', ['id' => $id]);
    return true;
}

/**
 * Add cached data needed by completion.
 *
 * @param stdClass $coursemodule
 * @return cached_cm_info|false
 */
function lgcplayground_get_coursemodule_info($coursemodule) {
    global $DB;

    $activity = $DB->get_record(
        'lgcplayground',
        ['id' => $coursemodule->instance],
        'id, name, intro, introformat, completionpass, track, missionpack',
    );
    if (!$activity) {
        return false;
    }

    $result = new cached_cm_info();
    $result->name = $activity->name;

    if ($coursemodule->showdescription) {
        $result->content = format_module_intro(
            'lgcplayground',
            $activity,
            $coursemodule->id,
            false,
        );
    }

    $result->customdata['track'] = $activity->track;
    $result->customdata['missionpack'] = $activity->missionpack;

    if ($coursemodule->completion == COMPLETION_TRACKING_AUTOMATIC) {
        $result->customdata['customcompletionrules']['completionpass'] = (int)$activity->completionpass;
    }

    return $result;
}

/**
 * Return human-readable active completion rules.
 *
 * @param cm_info|stdClass $cm
 * @return array
 */
function mod_lgcplayground_get_completion_active_rule_descriptions($cm): array {
    if (
        empty($cm->customdata['customcompletionrules']['completionpass'])
        || $cm->completion != COMPLETION_TRACKING_AUTOMATIC
    ) {
        return [];
    }

    return [get_string('completionpass', 'mod_lgcplayground')];
}
