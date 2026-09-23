<?php
require_once('../../config.php');

$id = required_param('id', PARAM_INT);

[$course, $cm] = get_course_and_cm_from_cmid($id, 'lgcplayground');
$activity = $DB->get_record('lgcplayground', ['id' => $cm->instance], '*', MUST_EXIST);

require_login($course, true, $cm);

$context = context_module::instance($cm->id);
require_capability('mod/lgcplayground:view', $context);

$PAGE->set_url('/mod/lgcplayground/view.php', ['id' => $cm->id]);
$PAGE->set_title(format_string($activity->name));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($context);

$props = [
    'activityName' => format_string($activity->name),
    'track' => (string)$activity->track,
    'missionPack' => (string)$activity->missionpack,
    'courseModuleId' => (int)$cm->id,
];

$templatecontext = [
    'cmid' => (int)$cm->id,
    'reactprops' => json_encode(
        $props,
        JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR,
    ),
    'loading' => get_string('loading', 'mod_lgcplayground'),
];

echo $OUTPUT->header();
echo $OUTPUT->render_from_template('mod_lgcplayground/view', $templatecontext);
echo $OUTPUT->footer();
