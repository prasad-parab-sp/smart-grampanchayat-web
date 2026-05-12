import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminFormatsComponent } from './pages/admin-formats/admin-formats.component';

const ADMIN_FORMATS_ROUTES: Routes = [{ path: '', component: AdminFormatsComponent }];

@NgModule({
  imports: [RouterModule.forChild(ADMIN_FORMATS_ROUTES), AdminFormatsComponent]
})
export class AdminFormatsModule {}
