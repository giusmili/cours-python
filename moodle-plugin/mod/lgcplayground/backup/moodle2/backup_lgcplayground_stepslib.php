<?php
// This file is part of Moodle - http://moodle.org/
defined('MOODLE_INTERNAL') || die;

class backup_lgcplayground_activity_structure_step extends backup_activity_structure_step {
    protected function define_structure() {
        $userinfo = $this->get_setting_value('userinfo');

        $playground = new backup_nested_element('lgcplayground', ['id'], [
            'name', 'intro', 'introformat', 'track', 'missionpack', 'completionpass',
            'timecreated', 'timemodified',
        ]);
        $progresses = new backup_nested_element('progresses');
        $progress = new backup_nested_element('progress', ['id'], [
            'userid', 'missionid', 'attempts', 'passed', 'timefirstattempt',
            'timelastattempt', 'timepassed', 'timecreated', 'timemodified',
        ]);

        $playground->add_child($progresses);
        $progresses->add_child($progress);
        $playground->set_source_table('lgcplayground', ['id' => backup::VAR_ACTIVITYID]);

        if ($userinfo) {
            $progress->set_source_table('lgcplayground_progress', ['playgroundid' => backup::VAR_PARENTID]);
            $progress->annotate_ids('user', 'userid');
        }

        $playground->annotate_files('mod_lgcplayground', 'intro', null);
        return $this->prepare_activity_structure($playground);
    }
}
