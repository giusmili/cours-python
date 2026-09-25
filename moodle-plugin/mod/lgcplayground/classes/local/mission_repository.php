<?php
namespace mod_lgcplayground\local;

defined('MOODLE_INTERNAL') || die();

/**
 * Loads immutable mission packs shipped with the plugin.
 */
final class mission_repository {
    /**
     * Load a mission pack by stable id.
     *
     * @param string $packid
     * @return array
     */
    public static function load(string $packid): array {
        if (!preg_match('/^[a-z0-9][a-z0-9-]*$/', $packid)) {
            throw new \moodle_exception('invalidmissionpack', 'mod_lgcplayground');
        }

        $pluginroot = dirname(__DIR__, 2);
        $path = $pluginroot . '/missionpacks/' . $packid . '.json';

        if (!is_readable($path)) {
            throw new \moodle_exception('missionpacknotfound', 'mod_lgcplayground', '', $packid);
        }

        try {
            $pack = json_decode((string)file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            throw new \moodle_exception(
                'missionpackinvalidjson',
                'mod_lgcplayground',
                '',
                $packid,
                $exception->getMessage(),
            );
        }

        self::validate($pack, $packid);
        return $pack;
    }

    /**
     * Return the first mission for a track.
     *
     * @param array $pack
     * @param string $track
     * @return array
     */
    public static function first_for_track(array $pack, string $track): array {
        return self::for_track($pack, $track)[0];
    }

    /**
     * Return all missions for a track in pedagogical order.
     *
     * @param array $pack
     * @param string $track
     * @return array
     */
    public static function for_track(array $pack, string $track): array {
        $missions = array_values(array_filter(
            $pack['missions'],
            static fn(array $mission): bool => ($mission['track'] ?? $pack['track']) === $track,
        ));

        if (!$missions) {
            throw new \moodle_exception('missionnotfound', 'mod_lgcplayground');
        }

        usort(
            $missions,
            static fn(array $left, array $right): int => ($left['order'] ?? 0) <=> ($right['order'] ?? 0),
        );

        return $missions;
    }

    /**
     * Return stable mission ids for a track.
     *
     * @param array $pack
     * @param string $track
     * @return string[]
     */
    public static function ids_for_track(array $pack, string $track): array {
        return array_map(
            static fn(array $mission): string => $mission['id'],
            self::for_track($pack, $track),
        );
    }

    /**
     * Validate the intentionally small v1 mission-pack contract.
     *
     * @param mixed $pack
     * @param string $expectedid
     * @return void
     */
    private static function validate(mixed $pack, string $expectedid): void {
        if (!is_array($pack)
                || ($pack['schemaVersion'] ?? null) !== 1
                || ($pack['id'] ?? null) !== $expectedid
                || !is_string($pack['track'] ?? null)
                || !is_array($pack['missions'] ?? null)
                || !$pack['missions']) {
            throw new \moodle_exception('missionpackinvalid', 'mod_lgcplayground', '', $expectedid);
        }

        $ids = [];
        foreach ($pack['missions'] as $mission) {
            if (!is_array($mission)
                    || !is_string($mission['id'] ?? null)
                    || trim($mission['id']) === ''
                    || !is_string($mission['starter'] ?? null)
                    || !is_array($mission['title'] ?? null)
                    || !is_array($mission['objective'] ?? null)
                    || !is_array($mission['validation'] ?? null)) {
                throw new \moodle_exception('missionpackinvalid', 'mod_lgcplayground', '', $expectedid);
            }

            if (isset($ids[$mission['id']])) {
                throw new \moodle_exception('missionpackduplicateid', 'mod_lgcplayground', '', $mission['id']);
            }
            $ids[$mission['id']] = true;
        }
    }
}
