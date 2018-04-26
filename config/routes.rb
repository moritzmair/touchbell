Rails.application.routes.draw do
  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  resources :bells
  get '/ringring/:id' => 'bells#ringring'
  root to: 'bells#home'
end
