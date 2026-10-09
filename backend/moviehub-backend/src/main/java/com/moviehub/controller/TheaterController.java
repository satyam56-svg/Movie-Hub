package com.moviehub.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api/theaters")
public class TheaterController {

    private final RestClient restClient;

    public TheaterController() {
        this.restClient = RestClient.create();
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public String getTheaters(
            @RequestParam double lat,
            @RequestParam double lon) {

        String query = """
                [out:json][timeout:15];
                (
                  node["amenity"="cinema"](around:10000,%f,%f);
                  way["amenity"="cinema"](around:10000,%f,%f);
                  relation["amenity"="cinema"](around:10000,%f,%f);
                );
                out center tags;
                """.formatted(lat, lon, lat, lon, lat, lon);

        try {
            String result = restClient
                    .post()
                    .uri("https://overpass-api.de/api/interpreter")
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
            System.err.println("Overpass API error: " + e.getMessage());
        }

        return "{\"elements\":[]}";
    }
}