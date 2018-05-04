# frozen_string_literal: true

class BellsController < ApplicationController
  before_action :set_bell, only: %i[show edit update destroy ringring]
  before_action :authenticate_user!

  def index
    @bells = Bell.all
  end

  def show
    unless current_user == @bell.user || current_user.admin?
      redirect_to(bells_url, alert: 'You can not view details for this bell') && return
    end
  end

  def new
    @bell = Bell.new
  end

  def edit; end

  def create
    unless current_user.bells.count.zero? || current_user.admin?
      redirect_to(bells_url, alert: 'You can only create one bell') && return
    end

    @bell = Bell.new(bell_params)
    @bell.user = current_user

    if @bell.save
      redirect_to @bell, notice: 'Bell was successfully created.'
    else
      render :new
    end
  end

  def update
    unless current_user == @bell.user || current_user.admin?
      redirect_to(bells_url, alert: 'You can not edit this bell') && return
    end
    if @bell.update(bell_params)
      redirect_to @bell, notice: 'Bell was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    unless current_user == @bell.user || current_user.admin?
      redirect_to(bells_url, alert: 'You can not delete this bell') && return
    end
    @bell.destroy
    redirect_to bells_url, notice: 'Bell was successfully destroyed.'
  end

  def ringring
    require 'net/http'
    uri = URI(@bell.trigger)
    response = Net::HTTP.get(uri)

    # redirect_to bells_url, notice: 'Klingel wurde ausgelöst: ' + response
    render json: response.to_json
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_bell
    @bell = Bell.find(params[:id])
  end

  # Only allow a trusted parameter "white list" through.
  def bell_params
    params.require(:bell).permit(:name, :trigger, :admin_hash, :logo, :background)
  end
end
