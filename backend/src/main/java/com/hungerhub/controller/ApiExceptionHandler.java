package com.hungerhub.controller;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler({IllegalArgumentException.class, EntityNotFoundException.class})
    ResponseEntity<Map<String,String>> badRequest(RuntimeException ex){return ResponseEntity.badRequest().body(Map.of("message",ex.getMessage()));}
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<Map<String,String>> conflict(Exception ex){return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message","This record conflicts with existing data."));}
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String,String>> validation(MethodArgumentNotValidException ex){
        String msg=ex.getBindingResult().getFieldErrors().stream().findFirst().map(e->e.getDefaultMessage()).orElse("Invalid input.");
        return ResponseEntity.badRequest().body(Map.of("message",msg));
    }
}
