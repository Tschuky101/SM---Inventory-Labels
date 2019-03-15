import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FileSaverModule } from 'ngx-filesaver';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent, ClearLabelsDialog, loadjson } from './app.component';
import { DisplayModels, FilterYears, FilterSizes } from './services/pipes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
	MatAutocompleteModule,
	MatBadgeModule,
	MatBottomSheetModule,
	MatButtonModule,
	MatButtonToggleModule,
	MatCardModule,
	MatCheckboxModule,
	MatChipsModule,
	MatDatepickerModule,
	MatDialogModule,
	MatDividerModule,
	MatExpansionModule,
	MatGridListModule,
	MatIconModule,
	MatInputModule,
	MatListModule,
	MatMenuModule,
	MatNativeDateModule,
	MatPaginatorModule,
	MatProgressBarModule,
	MatProgressSpinnerModule,
	MatRadioModule,
	MatRippleModule,
	MatSelectModule,
	MatSidenavModule,
	MatSliderModule,
	MatSlideToggleModule,
	MatSnackBarModule,
	MatSortModule,
	MatStepperModule,
	MatTableModule,
	MatTabsModule,
	MatToolbarModule,
	MatTooltipModule,
	MatTreeModule,
} from '@angular/material';

@NgModule({
  exports: [
    MatAutocompleteModule,
	MatBadgeModule,
	MatBottomSheetModule,
	MatButtonModule,
	MatButtonToggleModule,
	MatCardModule,
	MatCheckboxModule,
	MatChipsModule,
	MatDatepickerModule,
	MatDialogModule,
	MatDividerModule,
	MatExpansionModule,
	MatGridListModule,
	MatIconModule,
	MatInputModule,
	MatListModule,
	MatMenuModule,
	MatNativeDateModule,
	MatPaginatorModule,
	MatProgressBarModule,
	MatProgressSpinnerModule,
	MatRadioModule,
	MatRippleModule,
	MatSelectModule,
	MatSidenavModule,
	MatSliderModule,
	MatSlideToggleModule,
	MatSnackBarModule,
	MatSortModule,
	MatStepperModule,
	MatTableModule,
	MatTabsModule,
	MatToolbarModule,
	MatTooltipModule,
	MatTreeModule,
  ]
})

export class MaterialModule {}
@NgModule({
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatButtonModule,
    MatCheckboxModule,
    FileSaverModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    AppComponent,
    ClearLabelsDialog,
    loadjson,
    DisplayModels,
    FilterYears,
    FilterSizes
  ],
  entryComponents: [
	ClearLabelsDialog,
	loadjson
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
