package com.example.usos_oauth.offers.service;

import com.example.usos_oauth.offers.model.dao.Course;
import com.example.usos_oauth.offers.model.dao.Lecturer;
import com.example.usos_oauth.offers.model.dao.Offer;
import com.example.usos_oauth.offers.model.dao.OfferState;
import com.example.usos_oauth.offers.model.dto.CreateOfferRequest;
import com.example.usos_oauth.offers.model.dto.OfferDTO;
import com.example.usos_oauth.offers.repository.OfferRepository;
import com.example.usos_oauth.offers.service.exception.InvalidOfferException;
import com.example.usos_oauth.offers.service.exception.InvalidOfferStateException;
import com.example.usos_oauth.offers.service.exception.OperationForbiddenException;
import com.example.usos_oauth.security.model.User;
import com.example.usos_oauth.security.service.UserService;
import com.example.usos_oauth.usos.model.dto.CourseDTO;
import com.example.usos_oauth.usos.model.dto.GroupDTO;
import com.example.usos_oauth.usos.service.connect.UsosServiceAuthorizer;
import com.example.usos_oauth.usos.service.usos.UsosService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class OfferServiceTest {

    private static final ZoneId WARSAW = ZoneId.of("Europe/Warsaw");
    private static final String TERM = "2026Z";
    private static final String COURSE = "PROI";
    private static final String LAB = "Laboratorium";

    @Mock
    private OfferRepository offerRepository;
    @Mock
    private UserService userService;
    @Mock
    private UsosServiceAuthorizer usosServiceAuthorizer;
    @Mock
    private UsosService usosService;

    private OfferService offerService;
    private final User owner = user(1L, "owner");
    private final User student = user(2L, "student");

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(LocalDate.of(2026, 10, 13).atStartOfDay(WARSAW).toInstant(), WARSAW);
        offerService = new OfferService(offerRepository, userService, usosServiceAuthorizer, clock);
        when(usosServiceAuthorizer.getUsosService()).thenReturn(usosService);
    }

    @Test
    void createOffer_storesCurrentTermAndBothGroups() {
        when(userService.getCurrentUser()).thenReturn(owner);
        when(usosService.isCurrentUserInGroup(COURSE, LAB, 101)).thenReturn(true);
        when(offerRepository.findAllByOwnerAndTermId(owner, TERM)).thenReturn(List.of());
        when(offerRepository.save(any())).thenAnswer(invocation -> {
            Offer offer = invocation.getArgument(0);
            offer.setOfferId(42L);
            return offer;
        });

        Long id = offerService.createOfferForCurrentUser(request(COURSE, LAB, 101, COURSE, LAB, 102));

        assertThat(id).isEqualTo(42L);
        verify(offerRepository).save(org.mockito.ArgumentMatchers.argThat(offer ->
                TERM.equals(offer.getTermId())
                        && offer.getOwner() == owner
                        && offer.getMyCourse().getGroupNumber() == 101
                        && offer.getWantedCourse().getGroupNumber() == 102
                        && offer.getState() == OfferState.PENDING));
    }

    @Test
    void createOffer_rejectsGroupTheUserIsNotIn() {
        when(userService.getCurrentUser()).thenReturn(owner);
        when(usosService.isCurrentUserInGroup(COURSE, LAB, 101)).thenReturn(false);

        assertThatThrownBy(() -> offerService.createOfferForCurrentUser(request(COURSE, LAB, 101, COURSE, LAB, 102)))
                .isInstanceOf(OperationForbiddenException.class);
        verify(offerRepository, never()).save(any());
    }

    @Test
    void createOffer_rejectsInvalidExchanges() {
        assertThatThrownBy(() -> offerService.createOfferForCurrentUser(request(COURSE, LAB, 101, "AISDI", LAB, 102)))
                .isInstanceOf(InvalidOfferException.class);
        assertThatThrownBy(() -> offerService.createOfferForCurrentUser(request(COURSE, LAB, 101, COURSE, "Ćwiczenia", 2)))
                .isInstanceOf(InvalidOfferException.class);
        assertThatThrownBy(() -> offerService.createOfferForCurrentUser(request(COURSE, LAB, 101, COURSE, LAB, 101)))
                .isInstanceOf(InvalidOfferException.class);
        CreateOfferRequest noGroups = request(COURSE, LAB, 101, COURSE, LAB, 102);
        noGroups.getWantedCourse().setGroups(List.of());
        assertThatThrownBy(() -> offerService.createOfferForCurrentUser(noGroups))
                .isInstanceOf(InvalidOfferException.class);
    }

    @Test
    void createOffer_rejectsSecondActiveOfferForTheSameClass() {
        when(userService.getCurrentUser()).thenReturn(owner);
        when(usosService.isCurrentUserInGroup(COURSE, LAB, 101)).thenReturn(true);
        when(offerRepository.findAllByOwnerAndTermId(owner, TERM))
                .thenReturn(List.of(offer(1L, owner, OfferState.PENDING, 101, 103)));

        assertThatThrownBy(() -> offerService.createOfferForCurrentUser(request(COURSE, LAB, 101, COURSE, LAB, 102)))
                .isInstanceOf(InvalidOfferStateException.class);
    }

    @Test
    void sendRequest_setsReceiverAndState() {
        Offer offer = offer(1L, owner, OfferState.PENDING, 101, 102);
        when(offerRepository.findById(1L)).thenReturn(Optional.of(offer));
        when(userService.getCurrentUser()).thenReturn(student);
        when(usosService.isCurrentUserInGroup(COURSE, LAB, 102)).thenReturn(true);

        offerService.sendRequest(1L);

        assertThat(offer.getState()).isEqualTo(OfferState.REQUEST_SENT);
        assertThat(offer.getReceiver()).isSameAs(student);
        verify(offerRepository).save(offer);
    }

    @Test
    void sendRequest_cannotOverwriteSomeoneElsesRequest() {
        Offer offer = offer(1L, owner, OfferState.REQUEST_SENT, 101, 102);
        offer.setReceiver(user(3L, "first"));
        when(offerRepository.findById(1L)).thenReturn(Optional.of(offer));
        when(userService.getCurrentUser()).thenReturn(student);

        assertThatThrownBy(() -> offerService.sendRequest(1L)).isInstanceOf(InvalidOfferStateException.class);
        assertThat(offer.getReceiver().getUsername()).isEqualTo("first");
    }

    @Test
    void sendRequest_forbiddenForOwnerAndForUserOutsideWantedGroup() {
        Offer offer = offer(1L, owner, OfferState.PENDING, 101, 102);
        when(offerRepository.findById(1L)).thenReturn(Optional.of(offer));

        when(userService.getCurrentUser()).thenReturn(user(1L, "owner")); // equal by id, different instance
        assertThatThrownBy(() -> offerService.sendRequest(1L)).isInstanceOf(OperationForbiddenException.class);

        when(userService.getCurrentUser()).thenReturn(student);
        when(usosService.isCurrentUserInGroup(COURSE, LAB, 102)).thenReturn(false);
        assertThatThrownBy(() -> offerService.sendRequest(1L)).isInstanceOf(OperationForbiddenException.class);
        assertThat(offer.getState()).isEqualTo(OfferState.PENDING);
    }

    @Test
    void acceptRequest_requiresSentRequest() {
        Offer offer = offer(1L, owner, OfferState.PENDING, 101, 102);
        when(offerRepository.findById(1L)).thenReturn(Optional.of(offer));
        when(userService.getCurrentUser()).thenReturn(owner);

        // used to complete an offer without any receiver
        assertThatThrownBy(() -> offerService.acceptRequest(1L)).isInstanceOf(InvalidOfferStateException.class);

        offer.setState(OfferState.REQUEST_SENT);
        offer.setReceiver(student);
        offerService.acceptRequest(1L);
        assertThat(offer.getState()).isEqualTo(OfferState.COMPLETED);
    }

    @Test
    void acceptAndRejectAreOwnerOnly() {
        Offer offer = offer(1L, owner, OfferState.REQUEST_SENT, 101, 102);
        when(offerRepository.findById(1L)).thenReturn(Optional.of(offer));
        when(userService.getCurrentUser()).thenReturn(student);

        assertThatThrownBy(() -> offerService.acceptRequest(1L)).isInstanceOf(OperationForbiddenException.class);
        assertThatThrownBy(() -> offerService.rejectRequest(1L)).isInstanceOf(OperationForbiddenException.class);
        assertThatThrownBy(() -> offerService.deleteOffer(1L)).isInstanceOf(OperationForbiddenException.class);
    }

    @Test
    void rejectRequest_returnsOfferToPending() {
        Offer offer = offer(1L, owner, OfferState.REQUEST_SENT, 101, 102);
        offer.setReceiver(student);
        when(offerRepository.findById(1L)).thenReturn(Optional.of(offer));
        when(userService.getCurrentUser()).thenReturn(owner);

        offerService.rejectRequest(1L);

        assertThat(offer.getState()).isEqualTo(OfferState.PENDING);
        assertThat(offer.getReceiver()).isNull();
    }

    @Test
    void deleteOffer_completedExchangeCannotBeWithdrawn() {
        Offer offer = offer(1L, owner, OfferState.COMPLETED, 101, 102);
        when(offerRepository.findById(1L)).thenReturn(Optional.of(offer));
        when(userService.getCurrentUser()).thenReturn(owner);

        assertThatThrownBy(() -> offerService.deleteOffer(1L)).isInstanceOf(InvalidOfferStateException.class);
        verify(offerRepository, never()).delete(any());
    }

    @Test
    void unknownOfferIsNotFound() {
        when(offerRepository.findById(9L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> offerService.getOffer(9L)).isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void getOffersOfState_onlyListsCurrentTerm() {
        when(offerRepository.findAllByStateAndTermId(OfferState.PENDING, TERM))
                .thenReturn(List.of(offer(1L, owner, OfferState.PENDING, 101, 102)));

        List<OfferDTO> offers = offerService.getOffersOfState(OfferState.PENDING);

        assertThat(offers).extracting(OfferDTO::getOfferId).containsExactly(1L);
        verify(offerRepository, never()).findAllByState(any());
    }

    @Test
    void getOffersMatchingUserCourses_filtersByCourseAndOptionallyByExactGroup() {
        Offer wantsLab102 = offer(1L, owner, OfferState.PENDING, 101, 102);
        Offer wantsLab103 = offer(2L, owner, OfferState.PENDING, 101, 103);
        Offer otherCourse = offer(3L, owner, OfferState.PENDING, 101, 102);
        otherCourse.getWantedCourse().setUsosCourseId("AISDI");
        when(offerRepository.findAllByStateAndTermId(OfferState.PENDING, TERM))
                .thenReturn(List.of(wantsLab102, wantsLab103, otherCourse));
        // the student attends lab 102 and exercise group 103 (same number, other class type)
        when(usosService.getCurrentUserCourses()).thenReturn(List.of(CourseDTO.builder()
                .courseId(COURSE).courseName("Programowanie")
                .groups(List.of(group(LAB, 102), group("Ćwiczenia", 103)))
                .build()));

        assertThat(offerService.getOffersMatchingUserCourses(OfferState.PENDING, false))
                .extracting(OfferDTO::getOfferId).containsExactly(1L, 2L);
        assertThat(offerService.getOffersMatchingUserCourses(OfferState.PENDING, true))
                .extracting(OfferDTO::getOfferId).containsExactly(1L);
    }

    private static User user(long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        return user;
    }

    private static GroupDTO group(String classType, int number) {
        return GroupDTO.builder()
                .groupNumber(number)
                .classTypeName(classType)
                .lecturers(List.of("Jan Kowalski"))
                .weekday("Poniedziałek")
                .startTime("08:15")
                .endTime("10:00")
                .build();
    }

    private static CreateOfferRequest request(String myCourse, String myType, int myGroup,
                                              String wantedCourse, String wantedType, int wantedGroup) {
        return CreateOfferRequest.builder()
                .myCourse(CourseDTO.builder().courseId(myCourse).courseName(myCourse)
                        .groups(List.of(group(myType, myGroup))).build())
                .wantedCourse(CourseDTO.builder().courseId(wantedCourse).courseName(wantedCourse)
                        .groups(List.of(group(wantedType, wantedGroup))).build())
                .build();
    }

    private static Course course(int group) {
        Course course = new Course();
        course.setUsosCourseId(COURSE);
        course.setName("Programowanie");
        course.setClassTypeName(LAB);
        course.setGroupNumber(group);
        Lecturer lecturer = new Lecturer();
        lecturer.setLecturerName("Jan Kowalski");
        course.setLecturers(new ArrayList<>(List.of(lecturer)));
        return course;
    }

    private static Offer offer(long id, User owner, OfferState state, int myGroup, int wantedGroup) {
        Offer offer = new Offer();
        offer.setOfferId(id);
        offer.setOwner(owner);
        offer.setState(state);
        offer.setTermId(TERM);
        offer.setMyCourse(course(myGroup));
        offer.setWantedCourse(course(wantedGroup));
        return offer;
    }
}
