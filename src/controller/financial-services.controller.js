// controller/financial-services.controller.js
import { FinancialServicesService } from "../services/financial-services.services.js";
import { handleControllerError } from "../utils/validation.utils.js";
import {
  moedaCreateSchema,
  moedaUpdateSchema,
  categoriaServicoCreateSchema,
  categoriaServicoUpdateSchema,
  tipoServicoCreateSchema,
  tipoServicoUpdateSchema,
  idParamSchema
} from "../validations/financial-services.validations.js";

export class FinancialServicesController {
  // ===============================
  // MOEDAS - CRUD COMPLETO
  // ===============================

  static async createMoeda(req, res) {
    try {
      const validatedData = moedaCreateSchema.parse(req.body);
      const moeda = await FinancialServicesService.createMoeda(validatedData);
      
      res.status(201).json({
        success: true,
        message: "Moeda criada com sucesso",
        data: moeda,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao criar moeda", 400);
    }
  }

  static async updateMoeda(req, res) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const validatedData = moedaUpdateSchema.parse(req.body);

      const moeda = await FinancialServicesService.updateMoeda(id, validatedData);
      
      res.json({
        success: true,
        message: "Moeda atualizada com sucesso",
        data: moeda,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar moeda", 400);
    }
  }

  static async getMoedas(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await FinancialServicesService.getMoedas(page, limit, search);
      
      res.json({
        success: true,
        message: "Moedas encontradas",
        ...result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar moedas", 400);
    }
  }

  static async getMoedaById(req, res) {
    try {
      const { id } = idParamSchema.parse(req.params);

      const moeda = await FinancialServicesService.getMoedaById(id);
      
      res.json({
        success: true,
        message: "Moeda encontrada",
        data: moeda,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar moeda", 400);
    }
  }

  static async deleteMoeda(req, res) {
    try {
      const { id } = idParamSchema.parse(req.params);

      const result = await FinancialServicesService.deleteMoeda(id);
      
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao excluir moeda", 400);
    }
  }

  // ===============================
  // CATEGORIAS DE SERVIÇOS - CRUD COMPLETO
  // ===============================

  static async createCategoriaServico(req, res) {
    try {
      const validatedData = categoriaServicoCreateSchema.parse(req.body);
      const categoria = await FinancialServicesService.createCategoriaServico(validatedData);
      
      res.status(201).json({
        success: true,
        message: "Categoria de serviço criada com sucesso",
        data: categoria,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao criar categoria de serviço", 400);
    }
  }

  static async updateCategoriaServico(req, res) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const validatedData = categoriaServicoUpdateSchema.parse(req.body);

      const categoria = await FinancialServicesService.updateCategoriaServico(id, validatedData);
      
      res.json({
        success: true,
        message: "Categoria de serviço atualizada com sucesso",
        data: categoria,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar categoria de serviço", 400);
    }
  }

  static async getCategoriasServicos(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await FinancialServicesService.getCategoriasServicos(page, limit, search);
      
      res.json({
        success: true,
        message: "Categorias de serviços encontradas",
        ...result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar categorias de serviços", 400);
    }
  }

  static async getCategoriaServicoById(req, res) {
    try {
      const { id } = idParamSchema.parse(req.params);

      const categoria = await FinancialServicesService.getCategoriaServicoById(id);
      
      res.json({
        success: true,
        message: "Categoria de serviço encontrada",
        data: categoria,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar categoria de serviço", 400);
    }
  }

  static async deleteCategoriaServico(req, res) {
    try {
      const { id } = idParamSchema.parse(req.params);

      const result = await FinancialServicesService.deleteCategoriaServico(id);
      
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao excluir categoria de serviço", 400);
    }
  }

  // ===============================
  // TIPOS DE SERVIÇOS - CRUD COMPLETO
  // ===============================

  static async createTipoServico(req, res) {
    try {
      const validatedData = tipoServicoCreateSchema.parse(req.body);
      const tipoServico = await FinancialServicesService.createTipoServico(validatedData);
      
      res.status(201).json({
        success: true,
        message: "Tipo de serviço criado com sucesso",
        data: tipoServico,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao criar tipo de serviço", 400);
    }
  }

  static async updateTipoServico(req, res) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const validatedData = tipoServicoUpdateSchema.parse(req.body);

      const tipoServico = await FinancialServicesService.updateTipoServico(id, validatedData);
      
      res.json({
        success: true,
        message: "Tipo de serviço atualizado com sucesso",
        data: tipoServico,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar tipo de serviço", 400);
    }
  }

  static async getTiposServicos(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await FinancialServicesService.getTiposServicos(page, limit, search);
      
      res.json({
        success: true,
        message: "Tipos de serviços encontrados",
        ...result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar tipos de serviços", 400);
    }
  }

  static async getTipoServicoById(req, res) {
    try {
      const { id } = idParamSchema.parse(req.params);

      const tipoServico = await FinancialServicesService.getTipoServicoById(id);
      
      res.json({
        success: true,
        message: "Tipo de serviço encontrado",
        data: tipoServico,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar tipo de serviço", 400);
    }
  }

  static async deleteTipoServico(req, res) {
    try {
      const { id } = idParamSchema.parse(req.params);

      const result = await FinancialServicesService.deleteTipoServico(id);
      
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao excluir tipo de serviço", 400);
    }
  }

  // ===============================
  // OPERAÇÕES ESPECIAIS
  // ===============================

  static async getTiposServicosPorCategoria(req, res) {
    try {
      const { id } = idParamSchema.parse(req.params);

      const tiposServicos = await FinancialServicesService.getTiposServicosPorCategoria(id);
      
      res.json({
        success: true,
        message: "Tipos de serviços encontrados por categoria",
        data: tiposServicos,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar tipos de serviços por categoria", 400);
    }
  }

  static async getTiposServicosPorMoeda(req, res) {
    try {
      const { id } = idParamSchema.parse(req.params);

      const tiposServicos = await FinancialServicesService.getTiposServicosPorMoeda(id);
      
      res.json({
        success: true,
        message: "Tipos de serviços encontrados por moeda",
        data: tiposServicos,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar tipos de serviços por moeda", 400);
    }
  }

  static async getTiposServicosAtivos(req, res) {
    try {
      const tiposServicos = await FinancialServicesService.getTiposServicosAtivos();
      
      res.json({
        success: true,
        message: "Tipos de serviços ativos encontrados",
        data: tiposServicos,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar tipos de serviços ativos", 400);
    }
  }

  static async getTiposServicosComMulta(req, res) {
    try {
      const tiposServicos = await FinancialServicesService.getTiposServicosComMulta();
      
      res.json({
        success: true,
        message: "Tipos de serviços com multa encontrados",
        data: tiposServicos,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar tipos de serviços com multa", 400);
    }
  }

  static async getRelatorioFinanceiro(req, res) {
    try {
      const relatorio = await FinancialServicesService.getRelatorioFinanceiro();
      
      res.json({
        success: true,
        message: "Relatório financeiro gerado",
        data: relatorio,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao gerar relatório financeiro", 400);
    }
  }
}
