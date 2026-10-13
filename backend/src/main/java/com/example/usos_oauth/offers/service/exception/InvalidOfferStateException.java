package com.example.usos_oauth.offers.service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class InvalidOfferStateException extends RuntimeException {

    public InvalidOfferStateException(String message) {
        super(message);
    }
}
