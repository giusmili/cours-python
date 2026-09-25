<?php
require_once('../../config.php');

use mod_lgcplayground\local\mission_repository;
use mod_lgcplayground\local\progress_repository;

$id = required_param('id', PARAM_INT);

[$course, $cm] = get_course_and_cm_from_cmid($id, 'lgcplayground');
$activity = $DB->get_record('lgcplayground', ['id' => $cm->instance], '*', MUST_EXIST);

require_login($course, true, $cm);

$context = context_module::instance($cm->id);
require_capability('mod/lgcplayground:viewprogress', $context);

$PAGE->set_url('/mod/lgcplayground/report.php', ['id' => $cm->id]);
$PAGE->set_title(get_string('progressreport', 'mod_lgcplayground'));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($context);

$pack = mission_repository::load((string)$activity->missionpack);
$missionids = mission_repository::ids_for_track($pack, (string)$activity->track);
$totalmissions = count($missionids);

$enrolled = get_enrolled_users(
    $context,
    'mod/lgcplayground:view',
    0,
    'u.*',
    'u.lastname ASC, u.firstname ASC',
);
$learners = array_filter(
    $enrolled,
    static fn(stdClass $user): bool => !has_capability(
        'mod/lgcplayground:viewprogress',
        $context,
        (int)$user->id,
    ),
);

$summaries = progress_repository::summaries_for_users(
    (int)$activity->id,
    array_map(static fn(stdClass $user): int => (int)$user->id, $learners),
    $missionids,
);

$table = new html_table();
$table->attributes['class'] = 'generaltable';
$table->head = [
    get_string('learner', 'mod_lgcplayground'),
    get_string('missionspassed', 'mod_lgcplayground'),
    get_string('progress', 'mod_lgcplayground'),
    get_string('attempts', 'mod_lgcplayground'),
    get_string('lastactivity', 'mod_lgcplayground'),
];

foreach ($learners as $user) {
    $summary = $summaries[(int)$user->id] ?? ['attempts' => 0, 'passed' => 0, 'lastattempt' => 0];
    $passed = min((int)$summary['passed'], $totalmissions);
    $percent = $totalmissions > 0 ? (int)round(($passed / $totalmissions) * 100) : 0;

    $profileurl = new moodle_url('/user/view.php', [
        'id' => (int)$user->id,
        'course' => (int)$course->id,
    ]);
    $learnername = html_writer::link($profileurl, fullname($user));

    $progressbar = html_writer::div(
        html_writer::div(
            $percent . '%',
            'progress-bar',
            [
                'role' => 'progressbar',
                'style' => 'width: ' . $percent . '%',
                'aria-valuenow' => $percent,
                'aria-valuemin' => 0,
                'aria-valuemax' => 100,
            ],
        ),
        'progress',
        ['style' => 'min-width: 10rem;'],
    );

    $lastactivity = !empty($summary['lastattempt'])
        ? userdate((int)$summary['lastattempt'])
        : get_string('never', 'mod_lgcplayground');

    $table->data[] = [
        $learnername,
        $passed . ' / ' . $totalmissions,
        $progressbar,
        (int)$summary['attempts'],
        $lastactivity,
    ];
}

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('progressreport', 'mod_lgcplayground'));
echo html_writer::tag('p', get_string('progressreportintro', 'mod_lgcplayground'));
echo html_writer::div(
    html_writer::link(
        new moodle_url('/mod/lgcplayground/view.php', ['id' => $cm->id]),
        get_string('backtoplayground', 'mod_lgcplayground'),
        ['class' => 'btn btn-secondary'],
    ),
    'mb-3',
);

if ($learners) {
    echo html_writer::table($table);
} else {
    echo $OUTPUT->notification(get_string('nolearners', 'mod_lgcplayground'), 'info');
}

echo $OUTPUT->footer();
