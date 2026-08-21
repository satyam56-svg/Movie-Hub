package com.moviehub.service;

import com.moviehub.config.MovieDataLoader;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ScrapingService {

    private final MovieDataLoader movieDataLoader;

    public ScrapingService(MovieDataLoader movieDataLoader) {
        this.movieDataLoader = movieDataLoader;
    }

    // ==========================================================
    // RUN SCRAPER
    // ==========================================================

    public ScrapingResult runScraper(int limit) throws Exception {

        // ------------------------------------------------------
        // Validate scraper limit
        // ------------------------------------------------------

        if (limit <= 0) {
            throw new IllegalArgumentException(
                    "Scraper limit must be greater than 0"
            );
        }

        Path scraperDirectory =
                Paths.get(
                        "E:", "PROJECT", "Movie_rating", "scraper"
                ).toAbsolutePath().normalize();

        Path pipelineFile =
                scraperDirectory.resolve("pipeline.py");

        if (!Files.exists(scraperDirectory)) {
            throw new IllegalStateException(
                    "Scraper directory not found: "
                            + scraperDirectory
            );
        }

        if (!Files.exists(pipelineFile)) {
            throw new IllegalStateException(
                    "pipeline.py not found: "
                            + pipelineFile
            );
        }

        System.out.println(
                "\nStarting MovieHub scraper..."
        );

        System.out.println(
                "Scraper directory: "
                        + scraperDirectory
        );

        System.out.println(
                "Scraper limit: "
                        + limit
        );

        // ------------------------------------------------------
        // Run Python scraper with selected limit
        // ------------------------------------------------------

        ProcessBuilder processBuilder =
                new ProcessBuilder(
                        "python",
                        "pipeline.py",
                        "--limit",
                        String.valueOf(limit)
                );

        processBuilder
                .directory(scraperDirectory.toFile())
                .redirectErrorStream(true);

        Process process =
                processBuilder.start();

        StringBuilder output =
                new StringBuilder();

        try (BufferedReader reader =
                     new BufferedReader(
                             new InputStreamReader(
                                     process.getInputStream()
                             )
                     )) {

            String line;

            while ((line = reader.readLine()) != null) {

                System.out.println(
                        "[SCRAPER] " + line
                );

                output.append(line)
                        .append(System.lineSeparator());
            }
        }

        int exitCode =
                process.waitFor();

        if (exitCode != 0) {

            throw new IllegalStateException(
                    "Scraper failed with exit code "
                            + exitCode
                            + "\n\n"
                            + output
            );
        }

        System.out.println(
                "\nScraping completed successfully."
        );

        // ======================================================
        // IMPORT SCRAPED JSON INTO POSTGRESQL
        // ======================================================

        System.out.println(
                "Importing scraped movies into PostgreSQL..."
        );

        MovieDataLoader.MovieImportResult importResult =
                movieDataLoader.loadMoviesFromScraperFile(
                        scraperDirectory.resolve(
                                "movies_integrated.json"
                        )
                );

        System.out.println(
                "Scraped movies imported successfully."
        );

        return new ScrapingResult(
                importResult.inserted(),
                importResult.updated(),
                importResult.totalProcessed()
        );
    }

    // ==========================================================
    // RESULT
    // ==========================================================

    public record ScrapingResult(
            int inserted,
            int updated,
            int totalProcessed
    ) {
    }
}