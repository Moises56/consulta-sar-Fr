import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MisConsultasVbService } from '../../../core/services/mis-consultas-vb.service';
import { ToastrService } from 'ngx-toastr';
import { ConsultaVb, DeclaracionAmdc } from '../../../core/interfaces/mis-consultas-vb.interface';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

// Importaciones para exportación a PDF y Excel
import * as XLSX from 'xlsx';
// Importar ExcelJS para la exportación a Excel
import * as ExcelJS from 'exceljs';
// Importar pdfMake de forma compatible con TypeScript
declare const pdfMake: any;
// Necesario para que pdfmake funcione
import 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-mis-consultas-vb-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 w-full">
      <header class="bg-white shadow-sm w-full">
        <div class="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
          <div class="md:flex md:items-center md:justify-between">
            <div class="flex-1 min-w-0">
              <h2 class="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
                Detalle de Consulta
              </h2>
            </div>
            <div class="mt-4 flex flex-wrap space-x-2 md:mt-0 md:ml-4">
              <button
                *ngIf="consulta"
                (click)="exportarExcel()"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
              <button
                *ngIf="consulta"
                (click)="exportarPDF()"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
              <button
                (click)="goBack()"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </button>
              
              <button 
                *ngIf="isAdmin" 
                (click)="deleteConsulta()"
                [disabled]="loading || deleting"
                class="mt-2 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg *ngIf="!deleting" class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <svg *ngIf="deleting" class="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Loading indicator -->
        <div *ngIf="loading" class="flex justify-center py-10">
          <svg class="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Error message -->
        <div *ngIf="error" class="bg-red-50 p-4 rounded-md mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>

        <!-- Consultation details -->
        <div *ngIf="!loading && !error && consulta" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <!-- Header with company info -->
          <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ consulta.nombreComercial }}
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              RTN: {{ consulta.rtn }}
            </p>
          </div>

          <div class="border-t border-gray-200">
            <!-- Main data grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <!-- SAR Information -->
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-200">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 class="text-base font-medium text-gray-900">Información SAR</h4>
                </div>
                <div class="p-4">
                  <dl class="space-y-3">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <dt class="text-sm font-medium text-gray-500">Año</dt>
                        <dd class="mt-1 text-sm text-gray-900 font-semibold">{{consulta.anio}}</dd>
                      </div>
                      <div>
                        <dt class="text-sm font-medium text-gray-500">Total Ventas SAR</dt>
                        <dd class="mt-1 text-sm text-gray-900 font-semibold">
                          L. {{consulta.importeTotalVentas.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}}
                        </dd>
                      </div>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Fecha de Consulta</dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        {{formatDate(consulta.fechaConsulta)}}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <!-- AMDC Information -->
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-200">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 class="text-base font-medium text-gray-900">Información AMDC</h4>
                </div>
                <div class="p-4">
                  <dt class="text-sm font-medium text-gray-500 mb-3">Declaraciones</dt>
                  <div *ngIf="getDeclaracionesArray().length > 0" class="space-y-4">
                    <div *ngFor="let declaracion of getDeclaracionesArray(); let i = index" 
                      class="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors duration-150">
                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <dt class="text-xs font-medium text-gray-500">Cantidad Declarada</dt>
                          <dd class="text-sm text-gray-900 font-semibold">
                            L. {{formatNumber(declaracion.cantidadDeclarada)}}
                          </dd>
                        </div>
                        <div>
                          <dt class="text-xs font-medium text-gray-500">Estatus</dt>
                          <dd [class]="declaracion.estatus === 'Vigente' ? 'text-green-600 text-xs font-medium bg-green-100 px-2 py-0.5 rounded-full inline-block' : 'text-red-600 text-xs font-medium bg-red-100 px-2 py-0.5 rounded-full inline-block'">
                            {{declaracion.estatus}}
                          </dd>
                        </div>
                        <div>
                          <dt class="text-xs font-medium text-gray-500">Fecha</dt>
                          <dd class="text-sm text-gray-900">
                            {{declaracion.fecha}}
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div *ngIf="getDeclaracionesArray().length === 0" class="text-sm text-gray-500 italic">
                    No hay declaraciones registradas.
                  </div>
                </div>
              </div>
              
              <!-- Analysis -->
              <div class="md:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-200">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 class="text-base font-medium text-gray-900">Análisis Comparativo</h4>
                </div>
                <div class="p-4">
                  <dt class="text-sm font-medium text-gray-500">Diferencia</dt>
                  <dd class="mt-3" 
                      [ngClass]="getAnalisisClass()">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg" 
                         [ngClass]="getAnalisisBgClass()">
                      <span class="text-lg font-bold">
                        L. {{consulta.diferencia.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}}
                      </span>
                      <span class="text-sm">
                        <span class="inline-flex items-center">
                          <svg class="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path *ngIf="consulta.analisis.includes('contra')" fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                            <path *ngIf="consulta.analisis.includes('favor')" fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            <path *ngIf="consulta.analisis.includes('iguales')" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                          {{consulta.analisis}}
                        </span>
                      </span>
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MisConsultasVbDetalleComponent implements OnInit {
  consulta: ConsultaVb | null = null;
  loading = true;
  error: string | null = null;
  deleting = false;
  isAdmin = false;
  
  constructor(
    private misConsultasVbService: MisConsultasVbService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadConsulta();
    this.checkUserRole();
  }

  checkUserRole(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.isAdmin = user.role === 'ADMIN';
      }
    });
  }

  loadConsulta(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.error = 'ID de consulta no válido';
      this.loading = false;
      return;
    }

    this.misConsultasVbService.getConsultaDetalle(id)
      .pipe(
        catchError(error => {
          console.error('Error al cargar consulta:', error);
          this.error = 'No se pudo cargar la consulta. Verifique que exista o inténtelo de nuevo más tarde.';
          this.toastr.error(this.error);
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(response => {
        if (response) {
          // Fix type mismatch by converting response to ConsultaVb type
          this.consulta = this.convertToConsultaVb(response);
        }
      });
  }

  // Helper method to convert response to ConsultaVb with proper typing
  convertToConsultaVb(response: any): ConsultaVb {
    const consultaVb: ConsultaVb = {
      id: response.id,
      rtn: response.rtn,
      nombreComercial: response.nombreComercial,
      anio: response.anio,
      importeTotalVentas: response.importeTotalVentas,
      declaracionesAmdc: Array.isArray(response.declaracionesAmdc) ? 
        response.declaracionesAmdc : 
        (typeof response.declaracionesAmdc === 'string' ? 
          JSON.parse(response.declaracionesAmdc) : []),
      diferencia: response.diferencia,
      analisis: response.analisis,
      fechaConsulta: response.fechaConsulta,
      userId: response.usuarioId || response.userId // Map either usuarioId or userId to userId
    };
    return consultaVb;
  }

  deleteConsulta(): void {
    if (!this.consulta?.id || !this.isAdmin) return;

    if (confirm('¿Está seguro de que desea eliminar esta consulta? Esta acción no se puede deshacer.')) {
      this.deleting = true;

      this.misConsultasVbService.eliminarConsulta(this.consulta.id)
        .pipe(
          catchError(error => {
            console.error('Error al eliminar la consulta:', error);
            this.toastr.error('No se pudo eliminar la consulta. Inténtelo de nuevo más tarde.');
            return of(null);
          }),
          finalize(() => {
            this.deleting = false;
          })
        )
        .subscribe(response => {
          if (response) {
            this.toastr.success('Consulta eliminada con éxito');
            this.router.navigate(['/mis-consultas-vb']);
          }
        });
    }
  }

  // Método para exportar la consulta actual a Excel
  exportarExcel(): void {
    if (!this.consulta) {
      this.toastr.warning('No hay datos para exportar');
      return;
    }

    try {
      const datosExcel: any[] = [];
      const declaraciones = this.getDeclaracionesArray();
      const filasNecesarias = Math.max(1, declaraciones.length);
      
      // Para cada registro de declaración
      for (let i = 0; i < filasNecesarias; i++) {
        const fila: any = {};
        
        // Si es la primera fila, agregamos datos principales
        if (i === 0) {
          fila['#'] = 1;
          fila['RTN'] = this.consulta.rtn || 'N/A';
          fila['Nombre Comercial'] = this.consulta.nombreComercial || 'N/A';
          fila['Año'] = this.consulta.anio;
          fila['Total Ventas SAR'] = this.consulta.importeTotalVentas;
        } else {
          fila['#'] = '';
          fila['RTN'] = '';
          fila['Nombre Comercial'] = '';
          fila['Año'] = '';
          fila['Total Ventas SAR'] = '';
        }
        
        // Datos de declaraciones si hay registro para esta fila
        if (i < declaraciones.length) {
          const declaracion = declaraciones[i];
          fila['Cantidad Declarada'] = parseFloat(declaracion.cantidadDeclarada || '0');
          fila['Estatus'] = declaracion.estatus;
          fila['Fecha Declaración'] = declaracion.fecha;
        } else {
          fila['Cantidad Declarada'] = '';
          fila['Estatus'] = '';
          fila['Fecha Declaración'] = '';
        }
        
        // Agregar la diferencia y el análisis (solo para la primera fila)
        if (i === 0) {
          fila['Diferencia'] = Math.abs(this.consulta.diferencia);
          fila['Análisis'] = this.consulta.analisis;
          
          // Calculamos el monto ImptoBruto (1.5% del total de ventas)
          fila['ImptoBruto'] = this.consulta.importeTotalVentas * 0.015;
          
          // La tasa siempre es 1.5%
          // fila['Tasa'] = '1.5%';
          
          // Usuario que realizó la consulta
          const currentUser = this.authService.currentUser;
          fila['Usuario'] = currentUser ? currentUser.name : 'Usuario del sistema';
          
          // Fecha de consulta - formato fecha
          fila['Fecha Consulta'] = new Date().toLocaleDateString();
        } else {
          fila['Diferencia'] = '';
          fila['Análisis'] = '';
          fila['ImptoBruto'] = '';
          // fila['Tasa'] = '';
          fila['Usuario'] = '';
          fila['Fecha Consulta'] = '';
        }
        
        datosExcel.push(fila);
      }

      // Crear una hoja de trabajo y luego un libro
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Consulta VB');

      // Ajustar anchos de columna automáticamente
      const columnas = [
        { wch: 5 },  // #
        { wch: 20 }, // RTN
        { wch: 40 }, // Nombre Comercial
        { wch: 10 }, // Año
        { wch: 15 }, // Total Ventas SAR
        { wch: 15 }, // Cantidad Declarada
        { wch: 15 }, // Estatus
        { wch: 15 }, // Fecha Declaración
        { wch: 15 }, // Diferencia
        { wch: 30 }, // Análisis
        { wch: 15 }, // ImptoBruto
        // { wch: 10 }, // Tasa
        { wch: 25 }, // Usuario
        { wch: 15 }  // Fecha Consulta
      ];
      
      worksheet['!cols'] = columnas;

      // Generar el archivo Excel
      XLSX.writeFile(workbook, `Consulta_VentasBrutas_${this.consulta.rtn}_${this.consulta.anio}.xlsx`);
      this.toastr.success('Excel generado con éxito');
    } catch (error) {
      console.error('Error al generar Excel:', error);
      this.toastr.error('Error al generar el Excel');
    }
  }

  // Método para exportar a PDF la consulta actual
  exportarPDF(): void {
    if (!this.consulta) {
      this.toastr.warning('No hay datos para exportar');
      return;
    }
 
    try {
      // Rutas correctas de los logos
      const logoPath = 'logos/logo.png';
      const logoBuenCorazonPath = 'logos/logoBuenCorazon.png';
      
      // Cargar las imágenes primero
      this.loadImageAsBase64(logoPath).then(logoData => {
        this.loadImageAsBase64(logoBuenCorazonPath).then(logoBuenCorazonData => {
          
          // Fecha y hora actual y usuario que generó
          const now = new Date();
          const currentUser = this.authService.currentUser;
          
          // Crear el documento con los estilos
          const docDefinition: any = {
            pageSize: 'LETTER',
            // Reducir márgenes
            pageMargins: [40, 80, 40, 40],
  
            // Encabezado del documento
            header: {
              margin: [40, 20, 40, 20],
              columns: [
                {
                  image: logoData,
                  width: 80,
                  alignment: 'left',
                  margin: [0, 0, 0, 0],
                },
                {
                  stack: [
                    {
                      text: 'Unidad Municipal de Inteligencia Fiscal',
                      alignment: 'center',
                      fontSize: 16,
                      bold: true,
                      margin: [0, 10, 0, 5],
                      color: 'black',
                    },
                    {
                      text: 'Reporte de Volumen de Ventas Brutas',
                      alignment: 'center',
                      fontSize: 12,
                      bold: true,
                      margin: [0, 0, 0, 0],
                      color: '#5ccedf',
                    },
                  ],
                  alignment: 'center',
                },
                {
                  image: logoBuenCorazonData,
                  width: 80,
                  alignment: 'right',
                  margin: [0, 0, 0, 0],
                },
              ],
            },
  
            // Pie de página
            footer: (currentPage: number, pageCount: number) => {
              return {
                columns: [
                  {
                    text: '© 2025 Alcaldía Municipal del Distrito Central',
                    alignment: 'left',
                    fontSize: 8,
                    margin: [40, 5, 0, 0],
                    color: '#000',
                  },
                  {
                    text: `Página ${currentPage} de ${pageCount}`,
                    alignment: 'right',
                    fontSize: 8,
                    margin: [0, 5, 40, 0],
                    color: '#000',
                  },
                ],
              };
            },
  
            // Contenido del documento
            content: [
              // Metadata como fecha y usuario
              {
                columns: [
                  { width: '*', text: '' }, // Columna vacía para espaciado
                  {
                    width: 'auto',
                    stack: [
                      {
                        text: `Generado: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
                        fontSize: 8,
                        color: 'black',
                      },
                      {
                        text: `Generado por: ${
                          currentUser ? currentUser.name : 'Usuario del sistema'
                        }`,
                        fontSize: 8,
                        color: 'black',
                      },
                    ],
                    alignment: 'right',
                  },
                ],
                margin: [0, 0, 0, 10],
              },
            ],
  
            // Estilos para el documento
            styles: {
              header: {
                fontSize: 14,
                bold: true,
                margin: [0, 10, 0, 5],
                color: 'black',
              },
              subheader: {
                fontSize: 12,
                bold: true,
                margin: [0, 10, 0, 5],
                color: 'black',
              },
              tableHeader: {
                bold: true,
                fontSize: 10,
                color: 'white',
                fillColor: '#5ccedf',
              },
              tableCell: {
                fontSize: 9,
                color: 'black',
              },
              vigente: {
                fontSize: 9,
                color: '#059669',
              },
              rectificado: {
                fontSize: 9,
                color: '#DC2626',
              },
              diferenciaPositiva: {
                fontSize: 9,
                color: '#DC2626',
              },
              diferenciaNegativa: {
                fontSize: 9,
                color: '#059669',
              },
              diferenciaCero: {
                fontSize: 9,
                color: '#4B5563',
              },
            },
          };
  
          // Agregar título de la consulta - consulta ya fue validado como no null al inicio
          docDefinition.content.push({
            text: `Consulta - ${this.consulta?.nombreComercial || ''}`,
            style: 'header'
          });
          
          // Agregar RTN y año - consulta ya fue validado como no null al inicio
          docDefinition.content.push({
            text: `RTN: ${this.consulta?.rtn} - Año: ${this.consulta?.anio}`,
            style: 'subheader'
          });
          
          // Agregar información de SAR
          docDefinition.content.push({
            text: 'Información SAR',
            style: 'subheader',
            margin: [0, 5, 0, 5]
          });
          
          docDefinition.content.push({
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                [{ text: 'Concepto', style: 'tableHeader' }, { text: 'Valor', style: 'tableHeader' }],
                [{ text: 'Año', style: 'tableCell' }, { text: this.consulta?.anio, style: 'tableCell' }],
                [{ text: 'Total Ventas SAR', style: 'tableCell' }, { text: `L. ${this.consulta?.importeTotalVentas?.toFixed(2) || '0.00'}`, style: 'tableCell' }]
              ]
            },
            margin: [0, 5, 0, 10]
          });
          
          // Agregar información de AMDC
          docDefinition.content.push({
            text: 'Información AMDC',
            style: 'subheader',
            margin: [0, 5, 0, 5]
          });
          
          const declaraciones = this.getDeclaracionesArray();
          const amdcRows = [
            [
              { text: 'Cantidad Declarada', style: 'tableHeader' }, 
              { text: 'Estatus', style: 'tableHeader' }, 
              { text: 'Fecha', style: 'tableHeader' }
            ]
          ];

          declaraciones.forEach(declaracion => {
            amdcRows.push([
              { text: `L. ${parseFloat(declaracion.cantidadDeclarada || '0').toFixed(2)}`, style: 'tableCell' },
              { 
                text: declaracion.estatus, 
                style: declaracion.estatus === 'Vigente' ? 'vigente' : 'rectificado'
              },
              { 
                text: declaracion.fecha, 
                style: 'tableCell' 
              }
            ]);
          });
          
          docDefinition.content.push({
            table: {
              headerRows: 1,
              widths: ['*', '*', '*'],
              body: amdcRows
            },
            margin: [0, 5, 0, 10]
          });
          
          // Sección de análisis comparativo
          let estiloDiferencia = '';
          
          if ((this.consulta?.diferencia || 0) > 0) {
            estiloDiferencia = 'diferenciaPositiva';
          } else if ((this.consulta?.diferencia || 0) < 0) {
            estiloDiferencia = 'diferenciaCero';
          } else {
            estiloDiferencia = 'diferenciaCero';
          }
          
          docDefinition.content.push({
            text: 'Análisis Comparativo',
            style: 'subheader',
            margin: [0, 5, 0, 5]
          });
          
          docDefinition.content.push({
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                [{ text: 'Diferencia', style: 'tableHeader' }, { text: 'Análisis', style: 'tableHeader' }],
                [
                  { text: `L. ${Math.abs(this.consulta?.diferencia || 0).toFixed(2)}`, style: estiloDiferencia },
                  { text: this.consulta?.analisis || '', style: estiloDiferencia }
                ]
              ]
            },
            margin: [0, 5, 0, 10]
          });
          
          // Generar el PDF con el formato mejorado - consulta ya fue validado como no null al inicio
          pdfMake.createPdf(docDefinition).download(`Consulta_VentasBrutas_${this.consulta?.rtn}_${this.consulta?.anio}.pdf`);
          this.toastr.success('PDF generado con éxito');
        }).catch(error => {
          console.error('Error al cargar logoBuenCorazon:', error);
          this.toastr.error('Error al generar el PDF: No se pudo cargar una de las imágenes');
        });
      }).catch(error => {
        console.error('Error al cargar logo:', error);
        this.toastr.error('Error al generar el PDF: No se pudo cargar una de las imágenes');
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.toastr.error('Error al generar el PDF');
    }
  }

  // Método auxiliar para cargar imágenes como base64
  loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Necesario para permitir CORS
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            // Convertir a base64
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
          } else {
            reject(new Error('No se pudo obtener el contexto del canvas'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        reject(error);
      };
      
      img.src = url;
    });
  }

  // Métodos auxiliares
  getDeclaracionesArray(): DeclaracionAmdc[] {
    if (!this.consulta) return [];
    
    // Asegurar que declaracionesAmdc sea siempre un array, incluso si viene como string JSON
    if (typeof this.consulta.declaracionesAmdc === 'string') {
      try {
        return JSON.parse(this.consulta.declaracionesAmdc);
      } catch (e) {
        console.error('Error al parsear declaraciones:', e);
        return [];
      }
    } else if (Array.isArray(this.consulta.declaracionesAmdc)) {
      return this.consulta.declaracionesAmdc;
    }
    
    return [];
  }
  
  formatDate(date: string | Date | null | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'Fecha inválida' : d.toLocaleDateString('es-HN');
  }
  
  formatNumber(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '0.00';
    
    // Convertir a número si es string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Validar que sea un número válido
    if (isNaN(numValue)) return '0.00';
    
    return numValue.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  getAnalisisClass(): string {
    if (!this.consulta) return '';
    
    if (this.consulta.analisis.includes('favor')) {
      return 'text-green-700';
    } else if (this.consulta.analisis.includes('contra')) {
      return 'text-red-700';
    }
    return 'text-blue-700';
  }
  
  getAnalisisBgClass(): string {
    if (!this.consulta) return '';
    
    if (this.consulta.analisis.includes('favor')) {
      return 'bg-green-50';
    } else if (this.consulta.analisis.includes('contra')) {
      return 'bg-red-50';
    }
    return 'bg-blue-50';
  }
  
  goBack(): void {
    this.router.navigate(['/mis-consultas-vb']);
  }
}