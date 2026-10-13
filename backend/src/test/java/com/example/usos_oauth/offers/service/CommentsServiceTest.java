package com.example.usos_oauth.offers.service;

import com.example.usos_oauth.offers.model.dao.Offer;
import com.example.usos_oauth.offers.model.dto.CommentDTO;
import com.example.usos_oauth.offers.model.dto.CommentRequest;
import com.example.usos_oauth.offers.repository.OfferRepository;
import com.example.usos_oauth.offers.service.exception.OperationForbiddenException;
import com.example.usos_oauth.security.model.User;
import com.example.usos_oauth.security.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentsServiceTest {

    @Mock
    private OfferRepository offerRepository;
    @Mock
    private UserService userService;

    private CommentsService commentsService;
    private Offer offer;
    private final User owner = user(1L, "owner");
    private final User receiver = user(2L, "receiver");

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-10-13T10:15:30.123Z"), ZoneId.of("Europe/Warsaw"));
        commentsService = new CommentsService(offerRepository, userService, clock);
        offer = new Offer();
        offer.setOfferId(5L);
        offer.setOwner(owner);
        offer.setReceiver(receiver);
        when(offerRepository.findById(5L)).thenReturn(Optional.of(offer));
    }

    @Test
    void participantCanCommentAndDateIsSetByServer() {
        when(userService.getCurrentUser()).thenReturn(receiver);

        commentsService.addComment(new CommentRequest(5L, "Cześć!"));
        List<CommentDTO> comments = commentsService.getComments(5L);

        assertThat(comments).singleElement().satisfies(comment -> {
            assertThat(comment.getUsername()).isEqualTo("receiver");
            assertThat(comment.getText()).isEqualTo("Cześć!");
            assertThat(comment.getDate()).isEqualTo("2026-10-13T12:15:30+02:00");
            assertThat(comment.getOfferId()).isEqualTo(5L);
        });
    }

    @Test
    void otherUsersCannotReadOrWriteComments() {
        when(userService.getCurrentUser()).thenReturn(user(3L, "stranger"));

        assertThatThrownBy(() -> commentsService.getComments(5L)).isInstanceOf(OperationForbiddenException.class);
        assertThatThrownBy(() -> commentsService.addComment(new CommentRequest(5L, "hej")))
                .isInstanceOf(OperationForbiddenException.class);
    }

    private static User user(long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        return user;
    }
}
