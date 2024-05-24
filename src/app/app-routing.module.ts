import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { MonthlyPlanningComponent } from "./monthly-planning/monthly-planning.component";
import { TrainsComponent } from "./trains/trains.component";

const routes: Route[] = [
  {path: 'home', component: HomeComponent},
  // {path: 'monthly', component: MonthlyPlanningComponent},
  {path: 'trains', component: TrainsComponent},
  {path: '**', redirectTo: 'home'}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
