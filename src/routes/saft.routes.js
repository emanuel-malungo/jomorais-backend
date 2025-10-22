import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: SAFT
 *   description: Gestão de ficheiros SAFT-AO
 */

/**
 * @swagger
 * /api/finance-management/saft/validate:
 *   post:
 *     summary: Valida configuração SAFT
 *     tags: [SAFT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Configuração validada
 *       400:
 *         description: Erro de validação
 */
router.post('/validate', async (req, res) => {
  try {
    // Validação básica da configuração SAFT
    const config = req.body;
    
    // Validações mínimas
    const errors = [];
    
    if (!config.startDate) {
      errors.push('Data de início é obrigatória');
    }
    
    if (!config.endDate) {
      errors.push('Data de fim é obrigatória');
    }
    
    if (!config.companyInfo) {
      errors.push('Informações da empresa são obrigatórias');
    }
    
    const valid = errors.length === 0;
    
    res.json({
      valid,
      errors,
      message: valid ? 'Configuração válida' : 'Configuração inválida'
    });
    
  } catch (error) {
    console.error('Erro ao validar configuração SAFT:', error);
    res.status(500).json({
      valid: false,
      errors: ['Erro interno do servidor'],
      message: 'Erro ao validar configuração'
    });
  }
});

/**
 * @swagger
 * /api/finance-management/saft/export:
 *   post:
 *     summary: Exporta ficheiro SAFT
 *     tags: [SAFT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ficheiro SAFT exportado
 *       400:
 *         description: Erro na exportação
 */
router.post('/export', async (req, res) => {
  try {
    console.log('🔄 Gerando ficheiro SAFT real...');
    
    const config = req.body;
    const startDate = new Date(config.startDate);
    const endDate = new Date(config.endDate);
    const now = new Date();
    
    // Importar Prisma para buscar dados reais
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      // Buscar pagamentos do período
      const pagamentos = await prisma.tb_pagamentos.findMany({
        where: {
          data: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          aluno: {
            select: {
              codigo: true,
              nome: true,
              n_documento_identificacao: true
            }
          },
          tipoServico: {
            select: {
              designacao: true
            }
          }
        },
        orderBy: {
          data: 'asc'
        }
      });
      
      console.log(`📊 Encontrados ${pagamentos.length} pagamentos no período`);
      
      // Buscar alunos únicos (clientes)
      const alunosUnicos = [...new Map(
        pagamentos.map(p => [p.aluno.codigo, p.aluno])
      ).values()];
      
      console.log(`👥 ${alunosUnicos.length} alunos únicos encontrados`);
    
    // Inicializar cache de hashes para cálculo sequencial
    let hashCache = {};
    
    // Gerar XML SAFT-AO conforme Decreto Executivo 74/19 e XSD oficial
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:AO_1.04_01">
  <Header>
    <AuditFileVersion>1.04_01</AuditFileVersion>
    <CompanyID>AO123456789</CompanyID>
    <TaxRegistrationNumber>123456789</TaxRegistrationNumber>
    <TaxAccountingBasis>F</TaxAccountingBasis>
    <CompanyName>INSTITUTO MÉDIO POLITÉCNICO JO MORAIS</CompanyName>
    <BusinessName>INSTITUTO MÉDIO POLITÉCNICO JO MORAIS</BusinessName>
    <CompanyAddress>
      <AddressDetail>Luanda, Angola</AddressDetail>
      <City>Luanda</City>
      <PostalCode>1000</PostalCode>
      <Country>AO</Country>
      <Region>Luanda</Region>
    </CompanyAddress>
    <FiscalYear>${startDate.getFullYear()}</FiscalYear>
    <StartDate>${config.startDate}</StartDate>
    <EndDate>${config.endDate}</EndDate>
    <CurrencyCode>AOA</CurrencyCode>
    <DateCreated>${endDate > now ? endDate.toISOString().split('T')[0] : now.toISOString().split('T')[0]}</DateCreated>
    <TaxEntity>Global</TaxEntity>
    <ProductCompanyTaxID>123456789</ProductCompanyTaxID>
    <ProductID>JoMorais-ERP</ProductID>
    <ProductVersion>1.0</ProductVersion>
    <SoftwareCertificateNumber>0</SoftwareCertificateNumber>
    <SoftwareValidationNumber>123456789</SoftwareValidationNumber>
  </Header>
  <MasterFiles>
    <TaxTable>
      <TaxTableEntry>
        <TaxType>IVA</TaxType>
        <TaxCountryRegion>AO</TaxCountryRegion>
        <TaxCode>ISE</TaxCode>
        <Description>Isento</Description>
        <TaxPercentage>0.00</TaxPercentage>
      </TaxTableEntry>
    </TaxTable>
    <Customers>
      ${alunosUnicos.map((aluno, index) => `
      <Customer>
        <CustomerID>${aluno.codigo}</CustomerID>
        <AccountID>1</AccountID>
        <CustomerTaxID>999999999</CustomerTaxID>
        <CompanyName>${aluno.nome.replace(/[&<>"']/g, '')}</CompanyName>
        <BillingAddress>
          <AddressDetail>Luanda</AddressDetail>
          <City>Luanda</City>
          <PostalCode>1000</PostalCode>
          <Country>AO</Country>
          <Region>Luanda</Region>
        </BillingAddress>
        <SelfBillingIndicator>0</SelfBillingIndicator>
      </Customer>`).join('')}
    </Customers>
    <Products>
      <Product>
        <ProductType>S</ProductType>
        <ProductCode>PROPINA</ProductCode>
        <ProductDescription>Propina Escolar</ProductDescription>
        <ProductNumberCode>PROPINA</ProductNumberCode>
      </Product>
    </Products>
  </MasterFiles>
  <SourceDocuments>
    <SalesInvoices>
      <NumberOfEntries>${pagamentos.length}</NumberOfEntries>
      <TotalDebit>0.00</TotalDebit>
      <TotalCredit>${pagamentos.reduce((total, p) => total + (p.preco || 0), 0).toFixed(2)}</TotalCredit>
      ${pagamentos.map((pagamento, index) => {
        const invoiceNo = `FT JM2025/${String(index + 1).padStart(6, '0')}`;
        const invoiceDate = pagamento.data.toISOString().split('T')[0];
        const systemEntryDate = pagamento.data.toISOString().split('T')[0] + 'T' + pagamento.data.toISOString().split('T')[1].split('.')[0];
        const grossTotal = (pagamento.preco || 0).toFixed(2);
        
        // Calcular hash conforme Decreto 74/19: SHA-256(InvoiceNo;InvoiceDate;TaxInclusiveAmount;HashAnterior)
        const previousHash = index === 0 ? '' : hashCache[index - 1] || '';
        const hashInput = `${invoiceNo};${invoiceDate};${grossTotal};${previousHash}`;
        const realHash = crypto.createHash('sha256').update(hashInput, 'utf8').digest('hex').toUpperCase();
        
        // Hash calculado com SHA-256 conforme Decreto 74/19
        
        // Armazenar hash para próxima iteração
        hashCache[index] = realHash;
        
        return `
      <Invoice>
        <InvoiceNo>${invoiceNo}</InvoiceNo>
        <DocumentStatus>
          <InvoiceStatus>N</InvoiceStatus>
          <InvoiceStatusDate>${invoiceDate}</InvoiceStatusDate>
          <SourceID>1</SourceID>
          <SourceBilling>P</SourceBilling>
        </DocumentStatus>
        <Hash>${realHash}</Hash>
        <HashControl>1</HashControl>
        <InvoiceDate>${invoiceDate}</InvoiceDate>
        <InvoiceType>FT</InvoiceType>
        <SpecialRegimes>
          <SelfBillingIndicator>0</SelfBillingIndicator>
          <CashVATSchemeIndicator>0</CashVATSchemeIndicator>
          <ThirdPartiesBillingIndicator>0</ThirdPartiesBillingIndicator>
        </SpecialRegimes>
        <SourceID>1</SourceID>
        <SystemEntryDate>${systemEntryDate}</SystemEntryDate>
        <CustomerID>${pagamento.aluno.codigo}</CustomerID>
        <Line>
          <LineNumber>1</LineNumber>
          <ProductCode>PROPINA</ProductCode>
          <ProductDescription>${(pagamento.tipoServico?.designacao || 'Propina Escolar').replace(/[&<>"']/g, '')}</ProductDescription>
          <Quantity>1</Quantity>
          <UnitOfMeasure>UN</UnitOfMeasure>
          <UnitPrice>${(pagamento.preco || 0).toFixed(2)}</UnitPrice>
          <TaxPointDate>${invoiceDate}</TaxPointDate>
          <Description>${(pagamento.tipoServico?.designacao || 'Propina Escolar').replace(/[&<>"']/g, '')}</Description>
          <CreditAmount>${(pagamento.preco || 0).toFixed(2)}</CreditAmount>
          <Tax>
            <TaxType>IVA</TaxType>
            <TaxCountryRegion>AO</TaxCountryRegion>
            <TaxCode>ISE</TaxCode>
            <TaxPercentage>0.00</TaxPercentage>
            <TaxAmount>0.00</TaxAmount>
          </Tax>
          <TaxExemptionCode>M01</TaxExemptionCode>
          <TaxExemptionReason>Isento</TaxExemptionReason>
          <SettlementAmount>0.00</SettlementAmount>
        </Line>
        <DocumentTotals>
          <TaxPayable>0.00</TaxPayable>
          <NetTotal>${(pagamento.preco || 0).toFixed(2)}</NetTotal>
          <GrossTotal>${(pagamento.preco || 0).toFixed(2)}</GrossTotal>
        </DocumentTotals>
      </Invoice>`;
      }).join('')}
    </SalesInvoices>
    <Payments>
      <NumberOfEntries>0</NumberOfEntries>
      <TotalDebit>0.00</TotalDebit>
      <TotalCredit>0.00</TotalCredit>
    </Payments>
  </SourceDocuments>
</AuditFile>`;

    // Definir headers para download de arquivo XML
    const fileName = `SAFT_${startDate.getFullYear()}${String(startDate.getMonth() + 1).padStart(2, '0')}_${String(endDate.getDate()).padStart(2, '0')}.xml`;
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', Buffer.byteLength(xmlContent, 'utf8'));
    
    console.log(`✅ Ficheiro SAFT gerado: ${fileName}`);
    res.send(xmlContent);
    
    } catch (dbError) {
      console.error('Erro ao buscar dados do banco:', dbError);
      throw dbError;
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error('Erro ao exportar SAFT:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao exportar ficheiro SAFT',
      errors: [error.message]
    });
  }
});

/**
 * @swagger
 * /api/finance-management/saft/company-info:
 *   get:
 *     summary: Obtém informações da empresa para SAFT
 *     tags: [SAFT]
 *     responses:
 *       200:
 *         description: Informações da empresa
 *       404:
 *         description: Informações não encontradas
 */
router.get('/company-info', async (req, res) => {
  try {
    // Informações padrão da empresa
    const companyInfo = {
      companyID: 'AO123456789',
      registrationNumber: '123456789',
      name: 'INSTITUTO MÉDIO POLITÉCNICO JO MORAIS',
      businessName: 'INSTITUTO MÉDIO POLITÉCNICO JO MORAIS',
      address: {
        addressDetail: 'Luanda, Angola',
        city: 'Luanda',
        postalCode: '1000',
        region: 'Luanda',
        country: 'AO'
      },
      contacts: {
        telephone: '+244 XXX XXX XXX',
        fax: '',
        email: 'info@jomorais.ao',
        website: 'www.jomorais.ao'
      },
      taxRegistrationNumber: '123456789',
      taxAccountingBasis: 'F',
      companyAddress: {
        addressDetail: 'Luanda, Angola',
        city: 'Luanda',
        postalCode: '1000',
        region: 'Luanda', 
        country: 'AO'
      }
    };
    
    res.json({
      success: true,
      data: companyInfo
    });
    
  } catch (error) {
    console.error('Erro ao obter informações da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter informações da empresa',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/finance-management/saft/statistics:
 *   get:
 *     summary: Obtém estatísticas SAFT para o período
 *     tags: [SAFT]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Estatísticas do período
 *       400:
 *         description: Erro nos parâmetros
 */
router.get('/statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate e endDate são obrigatórios'
      });
    }
    
    console.log(`📊 Buscando estatísticas SAFT de ${startDate} a ${endDate}`);
    
    // Importar Prisma para buscar dados reais
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Buscar pagamentos do período
      const pagamentos = await prisma.tb_pagamentos.findMany({
        where: {
          data: {
            gte: start,
            lte: end
          }
        },
        include: {
          aluno: {
            select: {
              codigo: true,
              nome: true
            }
          },
          tipoServico: {
            select: {
              designacao: true
            }
          }
        }
      });
      
      // Calcular estatísticas
      const totalInvoices = pagamentos.length;
      const totalAmount = pagamentos.reduce((total, p) => total + (p.preco || 0), 0);
      const uniqueCustomers = [...new Set(pagamentos.map(p => p.aluno.codigo))].length;
      const uniqueProducts = [...new Set(pagamentos.map(p => p.tipoServico?.designacao))].length;
      
      // Agrupar por tipo de serviço
      const serviceTypes = pagamentos.reduce((acc, p) => {
        const service = p.tipoServico?.designacao || 'Outros';
        if (!acc[service]) {
          acc[service] = { count: 0, amount: 0 };
        }
        acc[service].count++;
        acc[service].amount += p.preco || 0;
        return acc;
      }, {});
      
      const statistics = {
        totalInvoices,
        totalCustomers: uniqueCustomers,
        totalProducts: uniqueProducts,
        totalPayments: totalInvoices,
        totalAmount: totalAmount,
        period: { startDate, endDate },
        breakdown: {
          byServiceType: serviceTypes,
          averageInvoiceValue: totalInvoices > 0 ? totalAmount / totalInvoices : 0
        }
      };
      
      console.log(`✅ Estatísticas calculadas: ${totalInvoices} faturas, ${totalAmount.toFixed(2)} AOA`);
      
      res.json({
        success: true,
        data: statistics
      });
      
    } catch (dbError) {
      console.error('Erro ao buscar dados do banco:', dbError);
      throw dbError;
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error('Erro ao obter estatísticas SAFT:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
      error: error.message
    });
  }
});

export default router;
