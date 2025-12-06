package com.example.Projeto3.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Voto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "feedback_id", nullable = false)
    private Feedback feedback;

    private boolean upvote;

    public Voto(Usuario usuario, Feedback feedback, boolean upvote) {
        this.usuario = usuario;
        this.feedback = feedback;
        this.upvote = upvote;
    }
}

