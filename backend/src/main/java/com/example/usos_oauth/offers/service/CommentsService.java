package com.example.usos_oauth.offers.service;

import com.example.usos_oauth.offers.model.dao.Comment;
import com.example.usos_oauth.offers.model.dao.Offer;
import com.example.usos_oauth.offers.model.dto.CommentDTO;
import com.example.usos_oauth.offers.model.dto.CommentRequest;
import com.example.usos_oauth.offers.repository.OfferRepository;
import com.example.usos_oauth.offers.service.exception.OperationForbiddenException;
import com.example.usos_oauth.security.model.User;
import com.example.usos_oauth.security.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;

/**
 * Chat between the two students taking part in an exchange.
 */
@Service
@RequiredArgsConstructor
public class CommentsService {

    private final OfferRepository offerRepository;
    private final UserService userService;
    private final Clock clock;

    @Transactional
    public void addComment(CommentRequest request) {
        Offer offer = findOfferOfParticipant(request.getOfferId());
        Comment comment = Comment.builder()
                .user(userService.getCurrentUser())
                .content(request.getText())
                .date(OffsetDateTime.now(clock).truncatedTo(ChronoUnit.SECONDS).toString())
                .build();
        offer.getComments().add(comment);
        offerRepository.save(offer);
    }

    @Transactional(readOnly = true)
    public List<CommentDTO> getComments(Long offerId) {
        Offer offer = findOfferOfParticipant(offerId);
        return offer.getComments().stream()
                .map(comment -> CommentDTO.builder()
                        .text(comment.getContent())
                        .date(comment.getDate())
                        .username(comment.getUser().getUsername())
                        .offerId(offerId)
                        .build())
                .toList();
    }

    private Offer findOfferOfParticipant(Long offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NoSuchElementException("Offer " + offerId + " not found"));
        Long userId = userService.getCurrentUser().getId();
        if (!isUser(offer.getOwner(), userId) && !isUser(offer.getReceiver(), userId)) {
            throw new OperationForbiddenException("Only the participants of an exchange can see its comments");
        }
        return offer;
    }

    private static boolean isUser(User user, Long userId) {
        return user != null && Objects.equals(user.getId(), userId);
    }
}
