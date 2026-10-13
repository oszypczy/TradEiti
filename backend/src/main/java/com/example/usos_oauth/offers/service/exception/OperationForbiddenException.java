package com.example.usos_oauth.offers.service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class OperationForbiddenException extends RuntimeException {

    public OperationForbiddenException() {
        super();
    }

    public OperationForbiddenException(String message) {
        super(message);
    }
}
