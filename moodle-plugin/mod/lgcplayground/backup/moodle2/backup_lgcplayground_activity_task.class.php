<?php
// This file is part of Moodle - http://moodle.org/
defined('MOODLE_INTERNAL') || die;

require_once($CFG->dirroot . '/mod/lgcplayground/backup/moodle2/backup_lgcplayground_stepslib.php');

class backup_lgcplayground_activity_task extends backup_activity_task {
    protected function define_my_settings() {
    }

    protected function define_my_steps() {
        $this->add_step(new backup_lgcplayground_activity_structure_step('lgcplayground_structure', 'lgcplayground.xml'));
    }

    public static function encode_content_links($content) {
        global $CFG;
        $base = preg_quote($CFG->wwwroot, '/');
        $search = '/(' . $base . '\/mod\/lgcplayground\/view.php\?id\=)([0-9]+)/';
        return preg_replace($search, '$@LGCPLAYGROUNDVIEWBYID*$2@$', $content);
    }
}
