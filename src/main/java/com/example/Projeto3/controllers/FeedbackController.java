package com.example.Projeto3.controllers;

import com.example.Projeto3.entities.Categoria;
import com.example.Projeto3.entities.Feedback;
import com.example.Projeto3.entities.Status; // Importando o Status
import com.example.Projeto3.services.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedbacks")
@CrossOrigin(origins = "*")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Autowired
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<Feedback> createFeedback(@RequestBody Feedback feedback) {
        Feedback novoFeedback = feedbackService.createFeedback(feedback);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoFeedback);
    }

    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable Long id) {
        return feedbackService.getFeedbackById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{userId}")
    public ResponseEntity<List<Feedback>> getFeedbacksByUserId(@PathVariable Long userId) {
        List<Feedback> feedbacks = feedbackService.getFeedbacksByUserId(userId);
        if (feedbacks == null || feedbacks.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<Feedback>> getFeedbacksByCategoria(@PathVariable Categoria categoria) {
        List<Feedback> feedbacks = feedbackService.getFeedbacksByCategoria(categoria);
        if (feedbacks == null || feedbacks.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(feedbacks);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Feedback> updateFeedback(@PathVariable Long id, @RequestBody Feedback feedbackDetails) {
        return feedbackService.updateFeedback(id, feedbackDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        if (feedbackService.deleteFeedback(id)) return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<Feedback> voteFeedback(@PathVariable Long id, @RequestParam Long userId) {
        return feedbackService.voteFeedback(id, true, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/votes/{userId}")
    public ResponseEntity<List<Long>> getUserVotes(@PathVariable Long userId) {
        return ResponseEntity.ok(feedbackService.getVotedFeedbackIds(userId));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<Feedback>> getRankingFeedbacks() {
        return ResponseEntity.ok(feedbackService.getTopFeedbacks());
    }

    @PatchMapping("/{id}/responder")
    public ResponseEntity<Feedback> responderFeedback(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return feedbackService.getFeedbackById(id)
                .map(feedback -> {
                    String textoResposta = payload.get("resposta");
                    if (textoResposta != null) {
                        feedback.setResposta(textoResposta);
                        // Atualiza o status para Respondido automaticamente
                        // Certifique-se que "Respondido" existe no seu Enum Status
                        feedback.setStatus(Status.Implementado);
                    }
                    return feedbackService.createFeedback(feedback);
                })
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}