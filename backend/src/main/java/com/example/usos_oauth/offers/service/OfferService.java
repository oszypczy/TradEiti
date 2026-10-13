package com.example.usos_oauth.offers.service;

import com.example.usos_oauth.offers.model.dao.Offer;
import com.example.usos_oauth.offers.model.dao.OfferState;
import com.example.usos_oauth.offers.model.dto.CreateOfferRequest;
import com.example.usos_oauth.offers.model.dto.OfferDTO;
import com.example.usos_oauth.offers.repository.OfferRepository;
import com.example.usos_oauth.offers.service.exception.InvalidOfferException;
import com.example.usos_oauth.offers.service.exception.InvalidOfferStateException;
import com.example.usos_oauth.offers.service.exception.OperationForbiddenException;
import com.example.usos_oauth.offers.service.utils.OfferDTOMapper;
import com.example.usos_oauth.security.model.User;
import com.example.usos_oauth.security.service.UserService;
import com.example.usos_oauth.usos.model.dto.CourseDTO;
import com.example.usos_oauth.usos.model.dto.GroupDTO;
import com.example.usos_oauth.usos.service.connect.UsosServiceAuthorizer;
import com.example.usos_oauth.usos.service.usos.UsosService;
import com.example.usos_oauth.usos.service.usos.utils.UsosTermCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.stream.Stream;

@RequiredArgsConstructor
@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final UserService userService;
    private final UsosServiceAuthorizer usosServiceAuthorizer;
    private final Clock clock;

    @Transactional
    public Long createOfferForCurrentUser(CreateOfferRequest createOffer) {
        validate(createOffer);
        User owner = userService.getCurrentUser();
        GroupDTO myGroup = createOffer.getMyCourse().getGroups().getFirst();
        String courseId = createOffer.getMyCourse().getCourseId();
        if (!usosServiceAuthorizer.getUsosService()
                .isCurrentUserInGroup(courseId, myGroup.getClassTypeName(), myGroup.getGroupNumber())) {
            throw new OperationForbiddenException("You are not a member of the offered group");
        }
        boolean alreadyOffered = offerRepository.findAllByOwnerAndTermId(owner, currentTerm()).stream()
                .filter(offer -> offer.getState() != OfferState.COMPLETED)
                .anyMatch(offer -> offer.getMyCourse().getUsosCourseId().equals(courseId)
                        && Objects.equals(offer.getMyCourse().getClassTypeName(), myGroup.getClassTypeName()));
        if (alreadyOffered) {
            throw new InvalidOfferStateException("You already have an active offer for this class");
        }
        return createOffer(createOffer, owner);
    }

    @Transactional
    public Long createOffer(CreateOfferRequest createOffer, User owner) {
        Offer offer = new Offer();
        offer.setOwner(owner);
        offer.setTermId(currentTerm());
        offer.setMyCourse(OfferDTOMapper.mapToCourse(createOffer.getMyCourse()));
        offer.setWantedCourse(OfferDTOMapper.mapToCourse(createOffer.getWantedCourse()));
        offerRepository.save(offer);
        return offer.getOfferId();
    }

    @Transactional(readOnly = true)
    public OfferDTO getOffer(Long id) {
        return OfferDTOMapper.mapToOfferDTO(findOffer(id));
    }

    @Transactional(readOnly = true)
    public List<OfferDTO> getAllOffers() {
        return offerRepository.findAll().stream()
                .map(OfferDTOMapper::mapToOfferDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OfferDTO> getOwnedOffers() {
        return offerRepository.findAllByOwnerAndTermId(userService.getCurrentUser(), currentTerm()).stream()
                .map(OfferDTOMapper::mapToOfferDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OfferDTO> getReceivedOffers() {
        return offerRepository.findAllByReceiverAndTermId(userService.getCurrentUser(), currentTerm()).stream()
                .map(OfferDTOMapper::mapToOfferDTO)
                .toList();
    }

    /**
     * Offers of the current term for courses the user attends. With {@code onlyFittingGroups} only offers
     * the user can accept are returned, i.e. the user attends the wanted group (same class type and number).
     */
    @Transactional(readOnly = true)
    public List<OfferDTO> getOffersMatchingUserCourses(OfferState state, boolean onlyFittingGroups) {
        UsosService usosService = usosServiceAuthorizer.getUsosService();
        List<CourseDTO> userCourses = usosService.getCurrentUserCourses();
        return getOffersOfState(state).stream()
                .filter(offer -> {
                    CourseDTO wanted = offer.getWantedCourse();
                    return userCourses.stream()
                            .filter(course -> course.getCourseId().equals(wanted.getCourseId()))
                            .anyMatch(course -> !onlyFittingGroups || containsGroup(course, wanted.getGroups().getFirst()));
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OfferDTO> getOffersOfState(OfferState state) {
        return offerRepository.findAllByStateAndTermId(state, currentTerm()).stream()
                .map(OfferDTOMapper::mapToOfferDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OfferDTO> getOffersWithUserOfState(OfferState state) {
        return Stream.of(getOwnedOffers(), getReceivedOffers())
                .flatMap(List::stream)
                .filter(offer -> offer.getState() == state)
                .toList();
    }

    @Transactional
    public void deleteOffer(Long id) {
        Offer offer = findOffer(id);
        assertIsOwner(offer, userService.getCurrentUser());
        if (offer.getState() == OfferState.COMPLETED) {
            throw new InvalidOfferStateException("A completed exchange cannot be withdrawn");
        }
        offerRepository.delete(offer);
    }

    @Transactional
    public void sendRequest(Long id) {
        Offer offer = findOffer(id);
        User currentUser = userService.getCurrentUser();
        if (isOwner(offer, currentUser)) {
            throw new OperationForbiddenException("You cannot accept your own offer");
        }
        assertState(offer, OfferState.PENDING);
        assertCurrentUserHasRequiredGroup(offer);
        offer.setReceiver(currentUser);
        offer.setState(OfferState.REQUEST_SENT);
        offerRepository.save(offer);
    }

    @Transactional
    public void acceptRequest(Long id) {
        Offer offer = findOffer(id);
        assertIsOwner(offer, userService.getCurrentUser());
        assertState(offer, OfferState.REQUEST_SENT);
        offer.setState(OfferState.COMPLETED);
        offerRepository.save(offer);
    }

    @Transactional
    public void rejectRequest(Long id) {
        Offer offer = findOffer(id);
        assertIsOwner(offer, userService.getCurrentUser());
        assertState(offer, OfferState.REQUEST_SENT);
        offer.setState(OfferState.PENDING);
        offer.setReceiver(null);
        offerRepository.save(offer);
    }

    private void validate(CreateOfferRequest request) {
        CourseDTO my = request.getMyCourse();
        CourseDTO wanted = request.getWantedCourse();
        if (my == null || wanted == null || my.getGroups() == null || my.getGroups().isEmpty()
                || wanted.getGroups() == null || wanted.getGroups().isEmpty()) {
            throw new InvalidOfferException("Both the offered and the wanted group are required");
        }
        if (!Objects.equals(my.getCourseId(), wanted.getCourseId())) {
            throw new InvalidOfferException("Groups can only be exchanged within the same course");
        }
        GroupDTO myGroup = my.getGroups().getFirst();
        GroupDTO wantedGroup = wanted.getGroups().getFirst();
        if (!Objects.equals(myGroup.getClassTypeName(), wantedGroup.getClassTypeName())) {
            throw new InvalidOfferException("Groups can only be exchanged within the same class type");
        }
        if (myGroup.getGroupNumber() == wantedGroup.getGroupNumber()) {
            throw new InvalidOfferException("The wanted group must differ from the offered one");
        }
    }

    private void assertCurrentUserHasRequiredGroup(Offer offer) {
        var wanted = offer.getWantedCourse();
        if (!usosServiceAuthorizer.getUsosService().isCurrentUserInGroup(
                wanted.getUsosCourseId(), wanted.getClassTypeName(), wanted.getGroupNumber())) {
            throw new OperationForbiddenException("You are not a member of the wanted group");
        }
    }

    private static boolean containsGroup(CourseDTO course, GroupDTO wanted) {
        return course.getGroups().stream()
                .anyMatch(group -> group.getGroupNumber() == wanted.getGroupNumber()
                        && Objects.equals(group.getClassTypeName(), wanted.getClassTypeName()));
    }

    private Offer findOffer(Long id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Offer " + id + " not found"));
    }

    private static void assertState(Offer offer, OfferState expected) {
        if (offer.getState() != expected) {
            throw new InvalidOfferStateException("Offer is " + offer.getState() + ", expected " + expected);
        }
    }

    private static boolean isOwner(Offer offer, User user) {
        return offer.getOwner() != null && Objects.equals(offer.getOwner().getId(), user.getId());
    }

    private static void assertIsOwner(Offer offer, User user) {
        if (!isOwner(offer, user)) {
            throw new OperationForbiddenException("Only the owner can do this");
        }
    }

    private String currentTerm() {
        return UsosTermCalculator.termFor(LocalDate.now(clock));
    }
}
