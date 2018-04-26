class BellsController < ApplicationController
  before_action :set_bell, only: [:show, :edit, :update, :destroy, :ringring]

  def home
    @bells = Bell.all
  end

  def index
    @bells = Bell.all
  end

  def show
  end

  def new
    @bell = Bell.new
  end

  def edit
  end

  def create
    @bell = Bell.new(bell_params)

    if @bell.save
      redirect_to @bell, notice: 'Bell was successfully created.'
    else
      render :new
    end
  end

  def update
    if @bell.update(bell_params)
      redirect_to @bell, notice: 'Bell was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @bell.destroy
    redirect_to bells_url, notice: 'Bell was successfully destroyed.'
  end

  def ringring
    require 'net/http'
    uri = URI(@bell.trigger)
    Net::HTTP.get(uri)

    redirect_to bells_url, notice: 'Klingel wurde ausgelöst'
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_bell
      @bell = Bell.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def bell_params
      params.require(:bell).permit(:name, :trigger, :admin_hash, :logo)
    end
end
