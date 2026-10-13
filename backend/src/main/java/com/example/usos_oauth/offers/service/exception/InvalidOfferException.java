package com.example.usos_oauth.offers.service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidOfferException extends RuntimeException {

    public InvalidOfferException(String message) {
        super(message);
    }
}
