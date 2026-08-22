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
                [out:json][timeout:25];
                (
                  node["amenity"="cinema"](around:5000,%f,%f);
                  way["amenity"="cinema"](around:5000,%f,%f);
                  relation["amenity"="cinema"](around:5000,%f,%f);
                );
                out center tags;
                """.formatted(lat, lon, lat, lon, lat, lon);

        return restClient
                .post()
                .uri("https://overpass-api.de/api/interpreter"))
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body("data=" + java.net.URLEncoder.encode(
                        query,
                        java.nio.charset.StandardCharsets.UTF_8
                ))
                .retrieve()
                .onStatus(
                        status -> status.isError(),
                        (request, response) -> {
                            System.out.println("OVERPASS STATUS: " + response.getStatusCode());
                            System.out.println("OVERPASS RESPONSE: " +
                                    new String(
                                            response.getBody().readAllBytes(),
                                            java.nio.charset.StandardCharsets.UTF_8
                                    ));
                        }
                )
                .body(String.class);
    }
}