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
        FEATURE_BACKUP_MOODLE2 => false,
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

    $DB->delete_records('lgcplayground', ['id' => $id]);
    return true;
}
