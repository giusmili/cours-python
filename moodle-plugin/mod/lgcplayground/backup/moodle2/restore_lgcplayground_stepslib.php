<?php
// This file is part of Moodle - http://moodle.org/
defined('MOODLE_INTERNAL') || die;

class restore_lgcplayground_activity_structure_step extends restore_activity_structure_step {
    protected function define_structure() {
        $paths = [new restore_path_element('lgcplayground', '/activity/lgcplayground')];
        if ($this->get_setting_value('userinfo')) {
            $paths[] = new restore_path_element('lgcplayground_progress', '/activity/lgcplayground/progresses/progress');
        }
        return $this->prepare_activity_structure($paths);
    }

    protected function process_lgcplayground($data) {
        global $DB;
        $data = (object) $data;
        $data->course = $this->get_courseid();
        $newitemid = $DB->insert_record('lgcplayground', $data);
        $this->apply_activity_instance($newitemid);
    }

    protected function process_lgcplayground_progress($data) {
        global $DB;
        $data = (object) $data;
        $data->playgroundid = $this->get_new_parentid('lgcplayground');
        $data->userid = $this->get_mappingid('user', $data->userid);
        if ($data->userid) {
            $DB->insert_record('lgcplayground_progress', $data);
        }
    }

    protected function after_execute() {
        $this->add_related_files('mod_lgcplayground', 'intro', null);
    }
}
