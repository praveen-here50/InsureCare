package com.insurecare.checks;

import java.nio.charset.StandardCharsets;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DocumentFileController {

    private final DocumentFiles files;

    public DocumentFileController(DocumentFiles files) {
        this.files = files;
    }

    /** The file a hospital uploaded for a document, shown inline in the browser. */
    @GetMapping("/api/document-files/{id}")
    public ResponseEntity<byte[]> file(@PathVariable Long id) {
        DocumentFiles.Download d = files.download(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(d.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(d.fileName(), StandardCharsets.UTF_8).build().toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(d.content());
    }

    @PostMapping("/api/document-files/{id}/recheck")
    public ResponseEntity<Void> recheck(@PathVariable Long id) {
        files.recheck(id);
        return ResponseEntity.accepted().build();
    }
}
