package com.example.Projeto3.entities;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Table(name = "feedback")
@Entity
@Getter
@Setter
@NoArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idFeedback;

    private String titulo;

    @ManyToOne
    @JoinColumn(name = "idUser")
    @JsonIgnoreProperties({"feedbacks", "password"})
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    private Categoria categoria;

    @Enumerated(EnumType.STRING)
    private Curso curso;

    private String mensagem;
    private LocalDateTime data = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private Status status = Status.Pendente;

    private int likes = 0;

    private int nps;

    @Column(columnDefinition = "TEXT")
    private String resposta;

    @OneToMany(mappedBy = "feedback", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Comentario> comentarios;

    @OneToMany(mappedBy = "feedback", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Voto> votos;

}