import express from 'express';
import { AcademicManagementController } from '../controller/academic-management.controller.js';

const router = express.Router();

// ========== ANO LETIVO - CRUD ==========
router.post('/anos-lectivos', AcademicManagementController.createAnoLectivo);
router.put('/anos-lectivos/:id', AcademicManagementController.updateAnoLectivo);
router.delete('/anos-lectivos/:id', AcademicManagementController.deleteAnoLectivo);

// ========== CURSOS - CRUD ==========
router.post('/cursos', AcademicManagementController.createCurso);
router.put('/cursos/:id', AcademicManagementController.updateCurso);
router.delete('/cursos/:id', AcademicManagementController.deleteCurso);

// ========== CLASSES - CRUD ==========
router.post('/classes', AcademicManagementController.createClasse);
router.put('/classes/:id', AcademicManagementController.updateClasse);
router.delete('/classes/:id', AcademicManagementController.deleteClasse);

// ========== DISCIPLINAS - CRUD ==========
router.post('/disciplinas', AcademicManagementController.createDisciplina);
router.put('/disciplinas/:id', AcademicManagementController.updateDisciplina);
router.delete('/disciplinas/:id', AcademicManagementController.deleteDisciplina);

// ========== SALAS - CRUD ==========
router.post('/salas', AcademicManagementController.createSala);
router.put('/salas/:id', AcademicManagementController.updateSala);
router.delete('/salas/:id', AcademicManagementController.deleteSala);

// ========== PERÍODOS - CRUD ==========
router.post('/periodos', AcademicManagementController.createPeriodo);
router.put('/periodos/:id', AcademicManagementController.updatePeriodo);
router.delete('/periodos/:id', AcademicManagementController.deletePeriodo);

// ========== TURMAS - CRUD ==========
router.post('/turmas', AcademicManagementController.createTurma);
router.put('/turmas/:id', AcademicManagementController.updateTurma);
router.delete('/turmas/:id', AcademicManagementController.deleteTurma);

// ========== GRADE CURRICULAR - CRUD ==========
router.post('/grade-curricular', AcademicManagementController.createGradeCurricular);
router.put('/grade-curricular/:id', AcademicManagementController.updateGradeCurricular);
router.delete('/grade-curricular/:id', AcademicManagementController.deleteGradeCurricular);

// ========== OPERAÇÕES ESPECIAIS ==========
router.get('/grade-curricular/curso/:codigo_Curso/classe/:codigo_Classe', AcademicManagementController.getGradeByCursoAndClasse);
router.get('/turmas/ano-lectivo/:codigo_AnoLectivo', AcademicManagementController.getTurmasByAnoLectivo);
router.get('/disciplinas/curso/:codigo_Curso', AcademicManagementController.getDisciplinasByCurso);
router.get('/turmas/classe/:codigo_Classe/curso/:codigo_Curso', AcademicManagementController.getTurmasByClasseAndCurso);

// ========== OPERAÇÕES EM LOTE ==========
router.post('/cursos/batch', AcademicManagementController.createMultipleCursos);
router.post('/disciplinas/batch', AcademicManagementController.createMultipleDisciplinas);
router.post('/turmas/batch', AcademicManagementController.createMultipleTurmas);

export default router;
