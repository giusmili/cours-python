<?php
defined('MOODLE_INTERNAL') || die();

/**
 * Upgrade steps for mod_lgcplayground.
 *
 * @param int $oldversion
 * @return bool
 */
function xmldb_lgcplayground_upgrade(int $oldversion): bool {
    global $DB;

    $dbman = $DB->get_manager();

    if ($oldversion < 2026092302) {
        $activity = new xmldb_table('lgcplayground');
        $completionpass = new xmldb_field(
            'completionpass',
            XMLDB_TYPE_INTEGER,
            '1',
            null,
            XMLDB_NOTNULL,
            null,
            '1',
            'missionpack',
        );
        if (!$dbman->field_exists($activity, $completionpass)) {
            $dbman->add_field($activity, $completionpass);
        }

        $progress = new xmldb_table('lgcplayground_progress');
        $progress->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE);
        $progress->add_field('playgroundid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL);
        $progress->add_field('userid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL);
        $progress->add_field('missionid', XMLDB_TYPE_CHAR, '100', null, XMLDB_NOTNULL);
        $progress->add_field('attempts', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $progress->add_field('passed', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '0');
        $progress->add_field('timefirstattempt', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $progress->add_field('timelastattempt', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $progress->add_field('timepassed', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $progress->add_field('timecreated', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $progress->add_field('timemodified', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $progress->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
        $progress->add_key('playgroundid', XMLDB_KEY_FOREIGN, ['playgroundid'], 'lgcplayground', ['id']);
        $progress->add_key('userid', XMLDB_KEY_FOREIGN, ['userid'], 'user', ['id']);
        $progress->add_index('playground-user-mission', XMLDB_INDEX_UNIQUE, ['playgroundid', 'userid', 'missionid']);

        if (!$dbman->table_exists($progress)) {
            $dbman->create_table($progress);
        }

        upgrade_mod_savepoint(true, 2026092302, 'lgcplayground');
    }

    if ($oldversion < 2026092303) {
        // No schema change. Bump the plugin version so Moodle invalidates
        // caches for the multi-mission React bundle and mission pack.
        upgrade_mod_savepoint(true, 2026092303, 'lgcplayground');
    }

    return true;
}
