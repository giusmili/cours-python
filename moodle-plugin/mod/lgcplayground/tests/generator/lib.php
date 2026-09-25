<?php
defined('MOODLE_INTERNAL') || die();

/**
 * Test data generator for mod_lgcplayground.
 *
 * @package mod_lgcplayground
 * @category test
 */
final class mod_lgcplayground_generator extends testing_module_generator {
    /**
     * Create a Playground activity for Moodle tests.
     *
     * @param array|stdClass|null $record
     * @param array|null $options
     * @return stdClass
     */
    public function create_instance($record = null, ?array $options = null): stdClass {
        $record = (object)(array)$record;

        $record->name ??= 'Playground test activity';
        $record->track ??= 'python';
        $record->missionpack ??= 'python-basics-v1';
        $record->completionpass ??= 1;

        return parent::create_instance($record, (array)$options);
    }
}
