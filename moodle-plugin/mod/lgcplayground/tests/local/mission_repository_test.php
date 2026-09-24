<?php
declare(strict_types=1);

namespace mod_lgcplayground\local;

defined('MOODLE_INTERNAL') || die();

use advanced_testcase;
use moodle_exception;

/**
 * Tests for immutable mission packs shipped with the plugin.
 *
 * @package mod_lgcplayground
 */
final class mission_repository_test extends advanced_testcase {
    public function test_python_pack_exposes_stable_ordered_ids(): void {
        $pack = mission_repository::load('python-basics-v1');

        $this->assertSame('python-basics-v1', $pack['id']);
        $this->assertSame('python', $pack['track']);
        $this->assertSame(
            [
                'python-00-terminal',
                'python-01-variables',
                'python-02-types',
                'python-03-conditions',
                'python-04-for-loop',
                'python-05-functions',
                'python-06-final-incident',
            ],
            mission_repository::ids_for_track($pack, 'python'),
        );

        $mission = mission_repository::first_for_track($pack, 'python');
        $this->assertSame('python-00-terminal', $mission['id']);
        $this->assertSame('python', $mission['validation']['kind']);
    }

    public function test_pack_identifier_rejects_path_traversal(): void {
        $this->expectException(moodle_exception::class);
        mission_repository::load('../config');
    }

    public function test_missing_track_is_rejected(): void {
        $pack = mission_repository::load('python-basics-v1');

        $this->expectException(moodle_exception::class);
        mission_repository::for_track($pack, 'web');
    }
}
