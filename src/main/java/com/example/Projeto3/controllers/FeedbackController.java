package com.example.Projeto3.controllers;

import com.example.Projeto3.entities.Categoria;
import com.example.Projeto3.entities.Feedback;
import com.example.Projeto3.services.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks") // Define a URL base para este controller
@CrossOrigin(origins = "*") // Permite requisições de qualquer front-end
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Autowired
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // Endpoint para CRIAR (POST) -> /api/feedbacks
    @PostMapping
    public ResponseEntity<Feedback> createFeedback(@RequestBody Feedback feedback) {
        Feedback novoFeedback = feedbackService.createFeedback(feedback);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoFeedback);
    }

    // Endpoint para LER TODOS (GET) -> /api/feedbacks
    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedbacks() {
        List<Feedback> feedbacks = feedbackService.getAllFeedbacks();
        return ResponseEntity.ok(feedbacks);
    }

    // Endpoint para LER POR ID (GET) -> /api/feedbacks/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable Long id) {
        return feedbackService.getFeedbackById(id)
                .map(ResponseEntity::ok) // Retorna 200 OK se encontrado
                .orElse(ResponseEntity.notFound().build()); // Retorna 404 se não encontrado
    }

    // Endpoint para LER POR USUARIO (GET) -> /api/feedbacks/usuario/{userId}
    @GetMapping("/usuario/{userId}")
    public ResponseEntity<List<Feedback>> getFeedbacksByUserId(@PathVariable Long userId) {
        List<Feedback> feedbacks = feedbackService.getFeedbacksByUserId(userId);
        if (feedbacks == null || feedbacks.isEmpty()) {
            return ResponseEntity.noContent().build(); // Retorna 204 se vazio
        }
        return ResponseEntity.ok(feedbacks);
    }

    // Endpoint para LER POR CATEGORIA -> /api/feedbacks/categoria/{categoria}
    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<Feedback>> getFeedbacksByCategoria(@PathVariable Categoria categoria) {
        List<Feedback> feedbacks = feedbackService.getFeedbacksByCategoria(categoria);

        if (feedbacks == null || feedbacks.isEmpty()) {
            return ResponseEntity.noContent().build(); // Retorna 204 se não houver resultados
        }

        return ResponseEntity.ok(feedbacks); // Retorna 200 OK com a lista
    }

    // Endpoint para ATUALIZAR (PUT) -> /api/feedbacks/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Feedback> updateFeedback(@PathVariable Long id, @RequestBody Feedback feedbackDetails) {
        return feedbackService.updateFeedback(id, feedbackDetails)
                .map(ResponseEntity::ok) // Retorna 200 OK se atualizado
                .orElse(ResponseEntity.notFound().build()); // Retorna 404 se não encontrado
    }

    // Endpoint para DELETAR (DELETE) -> /api/feedbacks/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        if (feedbackService.deleteFeedback(id)) {
            return ResponseEntity.noContent().build(); // 204 No Content se sucesso
        } else {
            return ResponseEntity.notFound().build(); // 404 se não encontrado
        }
    }

    // Endpoint para VOTAR (POST) -> /api/feedbacks/{id}/vote?userId=1
    @PostMapping("/{id}/vote")
    public ResponseEntity<Feedback> voteFeedback(@PathVariable Long id, @RequestParam Long userId) {
        return feedbackService.voteFeedback(id, true, userId) // Always pass true, service handles toggle
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para obter votos do usuário -> /api/feedbacks/votes/{userId}
    @GetMapping("/votes/{userId}")
    public ResponseEntity<List<Long>> getUserVotes(@PathVariable Long userId) {
        List<Long> votedIds = feedbackService.getVotedFeedbackIds(userId);
        return ResponseEntity.ok(votedIds);
    }

    // Endpoint para ranking (Top 3 mais votados) -> /api/feedbacks/ranking
    @GetMapping("/ranking")
    public ResponseEntity<List<Feedback>> getRankingFeedbacks() {
        List<Feedback> ranking = feedbackService.getTopFeedbacks();
        return ResponseEntity.ok(ranking);
    }
}
