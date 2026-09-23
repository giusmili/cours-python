<?php
defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/course/moodleform_mod.php');

final class mod_lgcplayground_mod_form extends moodleform_mod {
    public function definition(): void {
        $mform = $this->_form;

        $mform->addElement('text', 'name', get_string('name', 'mod_lgcplayground'), ['size' => 64]);
        $mform->setType('name', PARAM_TEXT);
        $mform->addRule('name', null, 'required', null, 'client');

        $this->standard_intro_elements();

        $mform->addElement(
            'select',
            'track',
            get_string('track', 'mod_lgcplayground'),
            [
                'python' => get_string('track_python', 'mod_lgcplayground'),
                'web' => get_string('track_web', 'mod_lgcplayground'),
            ],
        );
        $mform->setDefault('track', 'python');

        $mform->addElement('text', 'missionpack', get_string('missionpack', 'mod_lgcplayground'), ['size' => 40]);
        $mform->setType('missionpack', PARAM_TEXT);
        $mform->setDefault('missionpack', 'python-basics-v1');
        $mform->addHelpButton('missionpack', 'missionpack', 'mod_lgcplayground');

        $this->standard_coursemodule_elements();
        $this->add_action_buttons();
    }

    /**
     * Add the automatic completion rule.
     *
     * @return array
     */
    public function add_completion_rules(): array {
        $mform = $this->_form;
        $suffix = $this->get_suffix();
        $element = 'completionpass' . $suffix;

        $mform->addElement(
            'checkbox',
            $element,
            '',
            get_string('completionpass', 'mod_lgcplayground'),
        );
        $mform->setDefault($element, 1);

        return [$element];
    }

    /**
     * @param array $data
     * @return bool
     */
    public function completion_rule_enabled($data): bool {
        return !empty($data['completionpass' . $this->get_suffix()]);
    }
}
