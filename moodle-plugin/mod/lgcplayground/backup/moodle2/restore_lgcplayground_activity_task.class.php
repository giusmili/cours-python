<?php
// This file is part of Moodle - http://moodle.org/
defined('MOODLE_INTERNAL') || die;

require_once($CFG->dirroot . '/mod/lgcplayground/backup/moodle2/restore_lgcplayground_stepslib.php');

class restore_lgcplayground_activity_task extends restore_activity_task {
    protected function define_my_settings() {
    }

    protected function define_my_steps() {
        $this->add_step(new restore_lgcplayground_activity_structure_step('lgcplayground_structure', 'lgcplayground.xml'));
    }

    public static function define_decode_contents() {
        return [new restore_decode_content('lgcplayground', ['intro'], 'lgcplayground')];
    }

    public static function define_decode_rules() {
        return [new restore_decode_rule('LGCPLAYGROUNDVIEWBYID', '/mod/lgcplayground/view.php?id=$1', 'course_module')];
    }

    public static function define_restore_log_rules() {
        return [];
    }

    public static function define_restore_log_rules_for_course() {
        return [];
    }
}
