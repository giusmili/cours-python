<?php
defined('MOODLE_INTERNAL') || die();

$functions = [
    'mod_lgcplayground_record_attempt' => [
        'classname' => 'mod_lgcplayground\\external\\record_attempt',
        'description' => 'Record one learner validation attempt for a Playground mission.',
        'type' => 'write',
        'capabilities' => 'mod/lgcplayground:view',
        'ajax' => true,
    ],
];
