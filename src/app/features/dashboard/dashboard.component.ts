import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/interfaces/user.interface';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="w-full h-full pb-6">
      <!-- Welcome Banner -->
      <div
        class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-500 mb-8"
      >
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Bienvenido, {{ currentUser?.name }}
            </h1>
            <p class="mt-1 text-sm text-gray-500">¿Qué deseas hacer hoy?</p>
          </div>
          <div class="hidden sm:block">
            <img
              src="https://gestorimg.amdc.hn/uploads/1743178647837-488843555-logo2.webp"
              alt="Welcome"
              class="h-20 w-20"
            />
          </div>
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <!-- RTN Card -->
        <div
          class="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 w-full h-full flex flex-col"
        >
          <div class="p-5 flex-1">
            <div class="flex items-start">
              <div class="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg
                  class="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div class="ml-5 flex-1">
                <h3 class="text-lg font-medium text-gray-900">Consulta RTN</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Consulta información de RTN y ventas brutas
                </p>
              </div>
            </div>
            <div class="mt-4">
              <a
                routerLink="/rtn"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Ir a consulta
                <svg
                  class="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Datos AMDC Card -->
        <div
          class="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 w-full h-full flex flex-col"
        >
          <div class="p-5 flex-1">
            <div class="flex items-start">
              <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg
                  class="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div class="ml-5 flex-1">
                <h3 class="text-lg font-medium text-gray-900">Datos AMDC</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Gestiona los datos de la AMDC
                </p>
              </div>
            </div>
            <div class="mt-4">
              <a
                routerLink="/datos-amdc"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                Ver datos
                <svg
                  class="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Admin Section -->
        <div
          *ngIf="isAdmin"
          class="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 w-full h-full flex flex-col"
        >
          <div class="p-5 flex-1">
            <div class="flex items-start">
              <div class="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg
                  class="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div class="ml-5 flex-1">
                <h3 class="text-lg font-medium text-gray-900">
                  Gestión de Usuarios
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  Administra los usuarios del sistema
                </p>
              </div>
            </div>
            <div class="mt-4">
              <a
                routerLink="/usuarios"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                Gestionar usuarios
                <svg
                  class="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Profile Card -->
        <div
          class="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 w-full h-full flex flex-col"
        >
          <div class="p-5 flex-1">
            <div class="flex items-start">
              <div class="flex-shrink-0 bg-[#5ccedf] rounded-md p-3">
                <svg
                  class="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div class="ml-5 flex-1">
                <h3 class="text-lg font-medium text-gray-900">Mi Perfil</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Actualiza tu información personal
                </p>
              </div>
            </div>
            <div class="mt-4">
              <a
                routerLink="/perfil"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#5ccedf] hover:bg-[#4c828a] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Ver perfil
                <svg
                  class="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Mis consultas-->
        <div
          class="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 w-full h-full flex flex-col"
        >
          <div class="p-5 flex-1">
            <div class="flex items-start">
              <div class="flex-shrink-0 bg-amber-500 rounded-md p-3">
                <svg
                  class="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div class="ml-5 flex-1">
                <h3 class="text-lg font-medium text-gray-900">Mis Consultas</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Visualiza y gestiona tus consultas realizadas
                </p>
              </div>
            </div>
            <div class="mt-4">
              <a
                routerLink="/mis-consultas-vb"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
              >
                Ver mis consultas
                <svg
                  class="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.isAdmin = user?.role === 'ADMIN';
    });
  }
}
