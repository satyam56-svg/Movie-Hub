package com.moviehub.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.List;

@RestController
@RequestMapping("/api/theaters")
public class TheaterController {

    private final RestClient restClient;

    private static final List<String> OVERPASS_ENDPOINTS = List.of(
            "https://overpass.kumi.systems/api/interpreter",
            "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
            "https://overpass-api.de/api/interpreter"
    );

    public TheaterController() {
        this.restClient = RestClient.create();
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public String getTheaters(
            @RequestParam double lat,
            @RequestParam double lon) {

        String query = """
                [out:json][timeout:10];
                (
                  node["amenity"="cinema"](around:20000,%f,%f);
                  way["amenity"="cinema"](around:20000,%f,%f);
                );
                out center tags;
                """.formatted(lat, lon, lat, lon);

        for (String endpoint : OVERPASS_ENDPOINTS) {
            try {
                String result = restClient
                        .post()
                        .uri(endpoint)
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .body("data=" + java.net.URLEncoder.encode(
                                query,
                                java.nio.charset.StandardCharsets.UTF_8
                        ))
                        .retrieve()
                        .body(String.class);

                if (result != null && result.trim().startsWith("{")) {
                    return result;
                }
            } catch (Exception e) {
                System.err.println("Overpass endpoint " + endpoint + " failed: " + e.getMessage());
            }
        }

        return "{\"elements\":[]}";
    }
}