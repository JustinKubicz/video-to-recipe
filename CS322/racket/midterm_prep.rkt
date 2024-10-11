#lang racket

(define (my-length a-list)
  (if (null? a-list)
      0
      (+ 1 (my-length (cdr a-list)))))