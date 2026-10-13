package com.example.usos_oauth.offers.model.dao;

import com.example.usos_oauth.security.model.User;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "offer")
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "offer_seq")
    @SequenceGenerator(name = "offer_seq", allocationSize = 1)
    private long offerId;
    /** Optimistic locking: two students sending a request for the same offer at once must not both succeed. */
    @Version
    private Long version;
    @ManyToOne
    private User owner;
    @ManyToOne
    private User receiver;
    @Enumerated(EnumType.STRING)
    private OfferState state = OfferState.PENDING;
    /** USOS term (e.g. 2025Z) the offer was created in; offers from past terms are no longer listed. */
    private String termId;
    @OneToOne(cascade = CascadeType.ALL)
    private Course myCourse;
    @OneToOne(cascade = CascadeType.ALL)
    private Course wantedCourse;
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();
}
