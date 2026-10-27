package com.insurecare.member;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.insurecare.domain.MemberDocument;
import com.insurecare.member.MemberViews.DocumentView;
import com.insurecare.member.MemberViews.Portal;

@RestController
public class MemberController {

    private final MemberPortal portal;
    private final DocumentVault vault;

    public MemberController(MemberPortal portal, DocumentVault vault) {
        this.portal = portal;
        this.vault = vault;
    }

    /** Everything the patient portal shows for one member. */
    @GetMapping("/api/members/{memberRef}/portal")
    public Portal portal(@PathVariable String memberRef) {
        return portal.portal(memberRef);
    }

    @PostMapping(path = "/api/members/{memberRef}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentView upload(@PathVariable String memberRef, @RequestParam MultipartFile file,
                               @RequestParam(required = false) String name, @RequestParam String category) throws IOException {
        return vault.upload(memberRef, file, name, category);
    }

    @DeleteMapping("/api/members/{memberRef}/documents/{id}")
    public ResponseEntity<Void> delete(@PathVariable String memberRef, @PathVariable String id) {
        vault.delete(memberRef, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/documents/{id}/file")
    public ResponseEntity<byte[]> file(@PathVariable String id) {
        MemberDocument d = vault.file(id);
        String ext = d.getType().toLowerCase();
        String filename = d.getName().endsWith("." + ext) ? d.getName() : d.getName() + "." + ext;
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(d.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(filename, StandardCharsets.UTF_8).build().toString())
                .body(d.getContent());
    }
}
