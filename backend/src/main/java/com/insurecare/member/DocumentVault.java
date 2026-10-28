package com.insurecare.member;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.insurecare.config.AppProperties;
import com.insurecare.domain.MemberDocument;
import com.insurecare.domain.MemberDocumentRepository;
import com.insurecare.domain.MemberRepository;
import com.insurecare.live.Change;
import com.insurecare.member.MemberViews.DocumentView;
import com.insurecare.support.ApiErrors;

/** The member's document vault: uploads, downloads and deletes. */
@Service
@Transactional
public class DocumentVault {

    /** Accepted upload types and the label shown in the portal. */
    private static final Map<String, String> TYPES = Map.of("application/pdf", "PDF", "image/jpeg", "JPG", "image/png", "PNG");
    private static final double BYTES_PER_MB = 1024 * 1024;

    private final MemberDocumentRepository documents;
    private final MemberRepository members;
    private final ApplicationEventPublisher events;
    private final AppProperties props;

    public DocumentVault(MemberDocumentRepository documents, MemberRepository members, ApplicationEventPublisher events, AppProperties props) {
        this.documents = documents;
        this.members = members;
        this.events = events;
        this.props = props;
    }

    public DocumentView upload(String memberRef, MultipartFile file, String name, String category) throws IOException {
        String type = TYPES.get(file.getContentType());
        if (type == null) throw ApiErrors.badRequest("Please choose a PDF, JPG or PNG file.");
        if (file.isEmpty()) throw ApiErrors.badRequest("The file is empty.");
        if (!MemberDocument.CATEGORIES.contains(category)) throw ApiErrors.badRequest("Unknown category: " + category);

        MemberDocument d = new MemberDocument();
        d.setId("doc-" + UUID.randomUUID().toString().substring(0, 13));
        d.setMember(members.findById(memberRef).orElseThrow(() -> ApiErrors.notFound("Member " + memberRef)));
        d.setName(name == null || name.isBlank() ? file.getOriginalFilename() : name.trim());
        d.setCategory(category);
        d.setDateAdded(props.today());
        d.setType(type);
        d.setStatus("pending");
        d.setSizeMb(file.getSize() / BYTES_PER_MB);
        d.setContentType(file.getContentType());
        d.setContent(file.getBytes());
        documents.save(d);

        events.publishEvent(new Change("documents", d.getName() + " added"));
        events.publishEvent(new DocumentText.Added(d.getId()));
        return new DocumentView(d.getId(), d.getName(), d.getCategory(), d.getDateAdded().toString(), d.getType(), d.getStatus(), d.getSizeMb(),
                "/api/documents/" + d.getId() + "/file");
    }

    public void delete(String memberRef, String id) {
        MemberDocument d = documents.findById(id).filter(x -> x.getMember().getId().equals(memberRef))
                .orElseThrow(() -> ApiErrors.notFound("Document"));
        documents.delete(d);
        events.publishEvent(new Change("documents", d.getName() + " removed"));
    }

    /** A file from the member's own vault; another member's file is reported as not found. */
    @Transactional(readOnly = true)
    public MemberDocument file(String memberRef, String id) {
        MemberDocument d = documents.findById(id).filter(x -> x.getMember().getId().equals(memberRef))
                .orElseThrow(() -> ApiErrors.notFound("Document"));
        if (d.getContent() == null) throw ApiErrors.notFound("File for this sample document");
        return d;
    }
}
