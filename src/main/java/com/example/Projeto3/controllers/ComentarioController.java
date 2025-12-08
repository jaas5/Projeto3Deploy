package com.example.Projeto3.controllers;

import com.example.Projeto3.dtos.ComentarioRequest;
import com.example.Projeto3.entities.Comentario;
import com.example.Projeto3.entities.Feedback;
import com.example.Projeto3.entities.Usuario;
import com.example.Projeto3.services.ComentarioService;
import com.example.Projeto3.services.FeedbackService;
import com.example.Projeto3.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comentarios")
@CrossOrigin(origins = "*") // opcional: permite requisições do front-end
public class ComentarioController {

    private final ComentarioService comentarioService;
    private final FeedbackService feedbackService;
    private final UsuarioService usuarioService;

    @Autowired
    public ComentarioController(ComentarioService comentarioService, FeedbackService feedbackService, UsuarioService usuarioService) {
        this.comentarioService = comentarioService;
        this.feedbackService = feedbackService;
        this.usuarioService = usuarioService;
    }

    // 🔹 Criar um novo comentário
    @PostMapping
    public ResponseEntity<Comentario> createComentario(@RequestBody ComentarioRequest request) {
        Optional<Feedback> feedbackOpt = feedbackService.getFeedbackById(request.feedbackId());
        if (feedbackOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Validate user
        if (request.userId() == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Usuario> usuarioOpt = usuarioService.getUsuarioById(request.userId());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Comentario comentario = new Comentario();
        comentario.setMensagem(request.mensagem());
        comentario.setFeedback(feedbackOpt.get());
        comentario.setUsuario(usuarioOpt.get()); // Link user
        comentario.setData(LocalDateTime.now());

        // Handle parent comment
        if (request.parentId() != null) {
            Optional<Comentario> parentOpt = comentarioService.getComentarioById(request.parentId());
            if (parentOpt.isPresent()) {
                comentario.setParentComentario(parentOpt.get());
            } else {
                return ResponseEntity.badRequest().build();
            }
        }

        Comentario novoComentario = comentarioService.createComentario(comentario);
        return ResponseEntity.ok(novoComentario);
    }

    // 🔹 Listar todos os comentários de um feedback específico
    @GetMapping("/feedback/{feedbackId}")
    public ResponseEntity<List<Comentario>> getComentariosByFeedbackId(@PathVariable Long feedbackId) {
        List<Comentario> comentarios = comentarioService.getComentariosByFeedbackId(feedbackId);

        if (comentarios.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(comentarios);
    }

    // 🔹 Deletar um comentário (se for do usuário)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComentario(@PathVariable Long id, @RequestParam Long userId) {
        boolean deleted = comentarioService.deleteComentario(id, userId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.badRequest().build(); // Ou 403 Forbidden / 404 Not Found
        }
    }
}
